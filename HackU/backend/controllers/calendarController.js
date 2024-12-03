/*let reservations = []; // カレンダー予約データを一時的に保存

// カレンダー予約一覧を取得
const getReservations = (req, res) => {
  res.status(200).json(reservations);
};

// カレンダー予約を作成
const createReservation = (req, res) => {
  const { date, timeSlot, category, userId } = req.body;

  if (!date || !timeSlot || !category || !userId) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const reservation = { date, timeSlot, category, userId };
  reservations.push(reservation);

  res.status(200).json(reservation);
};

module.exports = { getReservations, createReservation };*/