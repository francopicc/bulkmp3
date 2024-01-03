const { Downloader } = require('ytdl-mp3');
const youtubeMetadata = require('youtube-metadata-from-url');
const readline = require('readline-sync');
const nodeID3 = require('node-id3');
const fs = require('fs');

async function getVideoMetadata(link) {
  try {
    const metadata = await youtubeMetadata.metadata(link);
    return {
      title: metadata.title,
      author: metadata.author_name,
      artist: metadata.author_name,
      originalFilename: metadata.title,
    };
  } catch (error) {
    console.error(`Error al obtener metadatos para ${link}: ${error.message}`);
    return null;
  }
}

async function main() {
  for (let i = 0; i < 5; i++) {
    const link = readline.question(`Introduce el link del video #${i + 1}. Puedes también pegarlo con CTRL + V.\nSi no deseas descargar más, presiona Enter sin ingresar un enlace.`);

    // Salir del bucle si no se proporciona un enlace
    if (!link.trim()) {
      break;
    }

    const downloader = new Downloader({
      outputDir: './output/',
    });

    try {
      console.log(`Obteniendo metadatos para ${link}...`);
      const metadata = await getVideoMetadata(link);

      if (metadata) {
        console.log(`Descargando '${metadata.title}' de '${metadata.author}'...`);
        const filePath = await downloader.downloadSong(link, {
          title: metadata.title,
          artist: metadata.author,
        });

        // Agregar metadata al archivo MP3
        const tags = {
          title: metadata.title,
          artist: metadata.author,
        };

        const success = nodeID3.write(tags, filePath);

        if (success) {
          console.log(`Metadata agregada al archivo ${filePath}`);

          // Renombrar el archivo con el título de la metadata
          const newFilePath = `${__dirname}/output/${metadata.title}.mp3`;
          fs.rename(filePath, newFilePath, (err) => {
            if (err) {
              console.error(`Error al renombrar el archivo: ${err}`);
            } else {
              console.log(`Archivo renombrado a ${newFilePath}`);
            }
          });
        } else {
          console.log(`No se pudo agregar metadata al archivo ${filePath}`);
        }
      }
    } catch (e) {
      console.log(`Ha ocurrido un error al descargar ${link}: ${e}`);
    }
  }
}

main();
