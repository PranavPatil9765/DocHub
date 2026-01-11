package com.example.DocHub.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.springframework.stereotype.Service;

import javax.imageio.*;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Files;
import java.util.Iterator;
import java.util.UUID;

@Service
public class PdfThumbnailService {

    private static final int DPI = 130; // balance: quality + speed

    public String generate(File pdfFile) throws Exception {

        // Ensure folder
        File dir = new File("thumbnails");
        if (!dir.exists()) dir.mkdirs();

        File output = new File(dir, UUID.randomUUID() + ".jpg");

        try (PDDocument document = PDDocument.load(pdfFile)) {

            PDFRenderer renderer = new PDFRenderer(document);

            // 1️⃣ Render first page
            BufferedImage image = renderer.renderImageWithDPI(
                    0,
                    DPI,
                    ImageType.RGB
            );

            // 2️⃣ Crop margins (remove viewer UI whitespace)
            BufferedImage cropped = cropMargins(image);
            BufferedImage Topcropped = cropTopOnly(cropped);
            // 3️⃣ Compress & save
            writeCompressedJpeg(Topcropped, output, 0.65f);
        }

        return "/thumbnails/" + output.getName();
    }

    /**
     * Removes top/bottom/side white margins
     */
    private BufferedImage cropMargins(BufferedImage src) {

        int width = src.getWidth();
        int height = src.getHeight();

        int cropTop = (int) (height * 0.05);   // 5% top
        int cropBottom = (int) (height * 0.05);
        int cropSides = (int) (width * 0.04);  // 4% left/right

        return src.getSubimage(
                cropSides,
                cropTop,
                width - (cropSides * 2),
                height - (cropTop + cropBottom)
        );
    }
    private BufferedImage cropTopOnly(BufferedImage src) {

    int width = src.getWidth();
    int height = src.getHeight();

    int topHeight = (int) (height * 0.45); // top 30% of page

    return src.getSubimage(
            0,              // x
            0,              // y (top)
            width,          // full width
            topHeight       // only top part
    );
}


    /**
     * High-compression JPEG (same idea as Sharp in Node)
     */
    private void writeCompressedJpeg(
            BufferedImage image,
            File output,
            float quality
    ) throws Exception {

        Iterator<ImageWriter> writers =
                ImageIO.getImageWritersByFormatName("jpg");

        ImageWriter writer = writers.next();

        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(quality);

        try (ImageOutputStream ios =
                     ImageIO.createImageOutputStream(output)) {

            writer.setOutput(ios);
            writer.write(null, new IIOImage(image, null, null), param);
        }

        writer.dispose();
    }
}
