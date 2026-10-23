import jwt from "jsonwebtoken";
export const sign = u => jwt.sign({ id:u.id, role:u.role, koperasiId:u.koperasiId }, process.env.JWT_SECRET, { expiresIn:"8h" });
// Autentikasi JWT dan pembatasan akses berdasarkan peran
export const auth = (...roles) => (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), process.env.JWT_SECRET); }
  catch { return res.status(401).json({ error:"Belum masuk atau sesi berakhir." }); }
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error:"Peran Anda tidak memiliki akses." });
  next();
};
// Admin melihat semua data, peran lain hanya data koperasinya
export const scope = u => (u.role === "ADMIN" ? null : u.koperasiId);
