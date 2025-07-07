import express, { Request, Response } from "express";
import archiver from "archiver";
import axios from "axios";

const zip = express.Router();

type songTypes = {
  title: string
  audio: string
};
// zip.use(express.json());
zip.post("/download", async (req:Request, res:Response) => {
  const { songs } = req.body as { songs : songTypes[]};
  const archive = archiver("zip", { zlib: { level: 9 } });

  res.attachment("playlist.zip");
  archive.pipe(res);

  await Promise.all(
    songs?.map(async (song) => {
      try {
        const response = await axios.get<ArrayBuffer>(song.audio, {
          responseType: "arraybuffer",
        });
        const safeTitle = (song.title || "track").replace(
          /[/\\?%*:|"<>]/g,
          "-"
        );
        archive.append(Buffer.from(response.data), { name: `${safeTitle}.mp3` });
      } catch (error:any) {
        console.error(`failed to fetch songs:${song.title}`, error.message);
      }
    })
  );

  await archive.finalize();
  console.log("recieved songs", songs);
});

export default zip;
