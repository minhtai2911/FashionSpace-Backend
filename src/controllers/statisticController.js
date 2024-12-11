import asyncHandler from "../middleware/asyncHandler.js";
import Statistic from "../models/statistic.js";
import cron from "node-cron";
import Order from "../models/order.js";

const createStatistic = asyncHandler(async (req, res, next) => {
  try {
    const { day, month, year } = req.body;

    const todayStart = new Date(year, month - 1, day);
    const todayEnd = new Date(year, month - 1, day + 1);

    const totalOrder = await Order.aggregate([
      {
        $lookup: {
          from: "ordertrackings",
          localField: "_id",
          foreignField: "orderId",
          as: "orderTrackings",
        },
      },
      {
        $unwind: "$orderTrackings",
      },
      {
        $match: {
          "orderTrackings.status": "Đã giao",
          createdDate: { $gte: todayStart, $lt: todayEnd },
        },
      },
      {
        $count: "totalOrders",
      },
    ]);

    const totalRevenue = await Order.aggregate([
      {
        $lookup: {
          from: "ordertrackings",
          localField: "_id",
          foreignField: "orderId",
          as: "orderTrackings",
        },
      },
      {
        $unwind: "$orderTrackings",
      },
      {
        $match: {
          "orderTrackings.status": "Đã giao",
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
    if (!totalOrder[0]) totalOrder[0] = { totalOrders: 0 };

    const statistic = new Statistic({
      day: day,
      month: month,
      year: year,
      totalOrder: totalOrder[0].totalOrders,
      totalRevenue: totalRevenue[0].totalRevenue,
    });

    await statistic.save();
    res.status(201).json({ data: statistic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getStatistics = asyncHandler(async (req, res, next) => {
  try {
    const query = {};
    if (req.query.year) query.year = parseInt(req.query.year);
    if (req.query.month) query.month = parseInt(req.query.month);
    if (req.query.day) query.day = parseInt(req.query.day);

    let statistics;

    if (!req.query.day && !req.query.month) {
      statistics = await Statistic.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            totalOrder: { $sum: "$totalOrder" },
            totalRevenue: { $sum: "$totalRevenue" },
          },
        },
        {
          $sort: { "_id.year": -1, "_id.month": -1 }, // Sắp xếp theo năm và tháng giảm dần
        },
      ]);
    } else {
      statistics = await Statistic.find(query).sort({
        year: -1,
        month: -1,
        day: -1,
      });
    }

    if (!statistics)
      return res.status(404).json({ error: "Báo cáo không tồn tại." });

    res.status(200).json({ data: statistics });
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

    const totalOrder = await Order.aggregate([
      {
        $lookup: {
          from: "ordertrackings",
          localField: "_id",
          foreignField: "orderId",
          as: "orderTrackings",
        },
      },
      {
        $unwind: "$orderTrackings",
      },
      {
        $match: {
          "orderTrackings.status": "Đã giao",
          createdDate: { $gte: todayStart, $lt: todayEnd },
        },
      },
      {
        $count: "totalOrders",
      },
    ]);

    const totalRevenue = await Order.aggregate([
      {
        $lookup: {
          from: "ordertrackings",
          localField: "_id",
          foreignField: "orderId",
          as: "orderTrackings",
        },
      },
      {
        $unwind: "$orderTrackings",
      },
      {
        $match: {
          "orderTrackings.status": "Đã giao",
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
    if (!totalOrder[0]) totalOrder[0] = { totalOrders: 0 };

    const statistic = new Statistic({
      day: day,
      month: month,
      year: year,
      totalOrder: totalOrder[0].totalOrders,
      totalRevenue: totalRevenue[0].totalRevenue,
    });

    await statistic.save();
  } catch (error) {
    throw new Error(error.message);
  }
});

export default {
  createStatistic: createStatistic,
  getStatistics: getStatistics,
};
