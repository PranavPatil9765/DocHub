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
import java.nio.file.Path;
import java.util.Iterator;
import java.util.UUID;

@Service
public class PdfThumbnailService {

    private static final int DPI = 130;

    private static final String THUMBNAIL_DIR =
            System.getProperty("user.dir") + "/thumbnails";

    public String generateThumbnail(Path tempPath, String originalName) throws Exception {
        File file = tempPath.toFile();
        String lower = originalName.toLowerCase();

        if (lower.endsWith(".pdf")) {
            return generatePdfThumbnail(file);
        }

        if (lower.endsWith(".png")
                || lower.endsWith(".jpg")
                || lower.endsWith(".jpeg")
                || lower.endsWith(".webp")) {
            return generateImageThumbnail(file);
        }

        return null; // other file types
    }

    /* ---------------- PDF ---------------- */

    private String generatePdfThumbnail(File pdfFile) throws Exception {

        File output = prepareOutput();

        try (PDDocument document = PDDocument.load(pdfFile)) {

            PDFRenderer renderer = new PDFRenderer(document);

            BufferedImage image = renderer.renderImageWithDPI(
                    0, DPI, ImageType.RGB
            );

            BufferedImage cropped = cropMargins(image);
            BufferedImage topCropped = cropTopOnly(cropped);

            writeCompressedJpeg(topCropped, output, 0.65f);
        }

        return "/thumbnails/" + output.getName();
    }

    /* ---------------- IMAGE ---------------- */

    private String generateImageThumbnail(File imageFile) throws Exception {

        File output = prepareOutput();

        BufferedImage image = ImageIO.read(imageFile);
        if (image == null) return null;

        BufferedImage resized = resize(image, 400);

        writeCompressedJpeg(resized, output, 0.7f);

        return "/thumbnails/" + output.getName();
    }

    /* ---------------- HELPERS ---------------- */

    private File prepareOutput() {
        File dir = new File(THUMBNAIL_DIR);
        if (!dir.exists()) dir.mkdirs();
        return new File(dir, UUID.randomUUID() + ".jpg");
    }

    private BufferedImage resize(BufferedImage src, int targetWidth) {

        int width = src.getWidth();
        int height = src.getHeight();

        int targetHeight = (targetWidth * height) / width;

        BufferedImage resized =
                new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);

        resized.getGraphics().drawImage(
                src.getScaledInstance(targetWidth, targetHeight, java.awt.Image.SCALE_SMOOTH),
                0, 0, null
        );

        return resized;
    }

    private BufferedImage cropMargins(BufferedImage src) {
        int width = src.getWidth();
        int height = src.getHeight();

        int cropTop = (int) (height * 0.05);
        int cropBottom = (int) (height * 0.05);
        int cropSides = (int) (width * 0.04);

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
        int topHeight = (int) (height * 0.45);

        return src.getSubimage(0, 0, width, topHeight);
    }

    private void writeCompressedJpeg(
            BufferedImage image,
            File output,
            float quality
    ) throws Exception {

        ImageWriter writer = ImageIO
                .getImageWritersByFormatName("jpg")
                .next();

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
