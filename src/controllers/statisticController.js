import asyncHandler from "../middleware/asyncHandler.js";
import Statistic from "../models/statistic.js";
import cron from "node-cron";
import Order from "../models/order.js";

const createStatistic = asyncHandler(async (req, res, next) => {
  try {
    const { day, month, year } = req.body;

    const todayStart = new Date(year, month - 1, day);
    const todayEnd = new Date(year, month - 1, day + 1);

    const totalOrder = await Order.countDocuments({
      createdDate: { $gte: todayStart, $lt: todayEnd },
    });

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdDate: {
            $gte: todayStart,
            $lt: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    if (!totalRevenue[0]) totalRevenue[0] = { totalRevenue: 0 };

    const statistic = new Statistic({
      day: day,
      month: month,
      year: year,
      totalOrder: totalOrder,
      totalRevenue: totalRevenue[0].totalRevenue,
    });

    await statistic.save();
    res.status(201).json(statistic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

cron.schedule("0 59 23 * * *", async () => {
  try {
    const today = new Date();

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const totalOrder = await Order.countDocuments({
      createdDate: { $gte: todayStart, $lt: todayEnd },
    });

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdDate: {
            $gte: todayStart,
            $lt: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    if (!totalRevenue[0]) totalRevenue[0] = { totalRevenue: 0 };

    const statistic = new Statistic({
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      totalOrder: totalOrder,
      totalRevenue: totalRevenue[0].totalRevenue,
    });

    await statistic.save();
  } catch (error) {
    throw new Error(error.message);
  }
});

export default {
  createStatistic: createStatistic,
};
