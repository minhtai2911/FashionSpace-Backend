from pymongo import MongoClient
import pandas as pd
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras import layers
import numpy as np


client = MongoClient('mongodb://localhost:27017/')
db = client['fashionspace']

pipeline = [
    {
        "$lookup": {
            "from": "orders",  
            "localField": "orderId",  
            "foreignField": "_id", 
            "as": "orderInfo"  
        }
    },
    {
        "$lookup": {
            "from": "productvariants", 
            "localField": "productVariantId",  
            "foreignField": "_id",  
            "as": "productVariantInfo"  
        }
    },
    {
        "$project": {
            "userId": {"$arrayElemAt": ["$orderInfo.userId", 0]}, 
            "productId": {"$arrayElemAt": ["$productVariantInfo.productId", 0]} 
        }
    }
]

dataRaw = pd.DataFrame(list(db.orderdetails.aggregate(pipeline)))

dataRaw['userId'] = dataRaw['userId'].apply(str)
dataRaw['productId'] = dataRaw['productId'].apply(str)

# Tiền xử lý dữ liệu
data = dataRaw[['userId', 'productId']]
data['interaction'] = 1  # Gán giá trị 1 cho mỗi lần người dùng mua sản phẩm

# Xử lý mã hóa userId và productId thành các chỉ số
user_encoder = {user: idx for idx, user in enumerate(data['userId'].unique())}
product_encoder = {product: idx for idx, product in enumerate(data['productId'].unique())}

data['user'] = data['userId'].map(user_encoder)
data['product'] = data['productId'].map(product_encoder)

user_count = len(user_encoder)
product_count = len(product_encoder)

# Tạo ma trận tương tác
interaction_matrix = np.zeros((user_count, product_count))

for row in data.itertuples():
    interaction_matrix[row.user, row.product] = 1  # Gán 1 nếu người dùng đã mua sản phẩm

# Chia dữ liệu thành train và test
X_train, X_test = train_test_split(data, test_size=0.2, random_state=42)

# Xây dựng mô hình Matrix Factorization với TensorFlow
embedding_size = 50  # Kích thước của embedding

user_input = layers.Input(shape=(1,), name='user')
product_input = layers.Input(shape=(1,), name='product')

user_embedding = layers.Embedding(input_dim=user_count, output_dim=embedding_size, input_length=1)(user_input)
product_embedding = layers.Embedding(input_dim=product_count, output_dim=embedding_size, input_length=1)(product_input)

dot_product = layers.Dot(axes=2)([user_embedding, product_embedding])
output = layers.Flatten()(dot_product)

model = tf.keras.models.Model(inputs=[user_input, product_input], outputs=output)
model.compile(optimizer='adam', loss='binary_crossentropy')

# Huấn luyện mô hình
X_train_user = X_train['user'].values
X_train_product = X_train['product'].values
y_train = np.ones_like(X_train_user)  # Gán tất cả là 1 vì đây là dữ liệu tương tác (mua)

model.fit([X_train_user, X_train_product], y_train, epochs=5, batch_size=64)

# Lưu mô hình
model.save('matrix_factorization_model.h5')

# def recommend(user_id, top_n=5):
#     user_idx = user_encoder[user_id]
#     product_indices = np.arange(product_count)

#     # Tạo đầu vào cho mô hình
#     user_input_array = np.full_like(product_indices, user_idx)
#     product_input_array = product_indices

#     # Dự đoán mức độ tương tác của người dùng với các sản phẩm
#     predictions = model.predict([user_input_array, product_input_array])

#     # Lấy top N sản phẩm
#     top_n_indices = predictions.argsort()[-top_n:][::-1]
#     top_n_product_ids = [list(product_encoder.keys())[list(product_encoder.values()).index(i)] for i in top_n_indices]

#     return top_n_product_ids

# # Đưa ra 5 sản phẩm gợi ý cho người dùng với user_id = 1
# recommended_products = recommend('6763e1d9c1b8096c98587a3e', 2)
# print(recommended_products)
