const fs = require("fs");
const path = require("path");
const db = require("./src/config/database");

const migrate = async () => {
  const direction = process.argv[2] || "up";
  if (direction !== "up" && direction !== "down") {
    console.error(
      'Arah migrasi tidak valid! Gunakan argumen "up" atau "down".',
    );
    process.exit(1);
  }

  try {
    const migrationsDir = path.join(__dirname, "migrations");

    const files = fs.readdirSync(migrationsDir);

    let targetFiles = files.filter((file) =>
      file.endsWith(`.${direction}.sql`),
    );

    if (direction === "up") {
      targetFiles.sort();
    } else {
      targetFiles.sort().reverse();
    }

    if (targetFiles.length === 0) {
      console.log(
        `Tidak ada file migrasi dengan format .${direction}.sql yang ditemukan.`,
      );
      process.exit(0);
    }

    console.log(
      `Menemukan ${targetFiles.length} file migrasi (${direction.toUpperCase()}).`,
    );

    for (const file of targetFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`[RUNNING] Menjalankan: ${file}...`);
      await db.query(sql);
      console.log(`[SUCCESS] Selesai: ${file}`);
    }

    console.log(`Semua proses migrasi (${direction.toUpperCase()}) sukses!`);
    process.exit(0);
  } catch (err) {
    console.error(`Migrasi (${direction.toUpperCase()}) gagal:`, err);
    process.exit(1);
  }
};

migrate();
