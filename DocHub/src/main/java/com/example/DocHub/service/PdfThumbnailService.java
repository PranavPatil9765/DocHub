package com.example.DocHub.service;

import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

import javax.imageio.*;
import javax.imageio.stream.ImageOutputStream;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class PdfThumbnailService {

    private static final int DPI = 50; // Safe for Render low RAM
    private final Cloudinary cloudinary;

    public String generateThumbnail(String tempPath, String originalName) throws Exception {

        File file = new File(tempPath);
        if (!file.exists()) {
            throw new IllegalArgumentException("File not found at path: " + tempPath);
        }

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

        return null;
    }

    /* ---------------- PDF ---------------- */

    private String generatePdfThumbnail(File pdfFile) throws Exception {

        try (PDDocument document = PDDocument.load(
                pdfFile,
                MemoryUsageSetting.setupTempFileOnly())) {

            PDFRenderer renderer = new PDFRenderer(document);

            BufferedImage image =
                    renderer.renderImageWithDPI(0, DPI, ImageType.RGB);

            BufferedImage cropped = cropMargins(image);
            BufferedImage topCropped = cropTopOnly(cropped);

            return uploadToCloudinary(topCropped);
        }
    }

    /* ---------------- IMAGE ---------------- */

    private String generateImageThumbnail(File imageFile) throws Exception {

        BufferedImage image = ImageIO.read(imageFile);
        if (image == null) return null;

        BufferedImage resized = resize(image, 400);

        return uploadToCloudinary(resized);
    }

    /* ---------------- HELPERS ---------------- */

    private BufferedImage resize(BufferedImage src, int targetWidth) {

        int width = src.getWidth();
        int height = src.getHeight();

        int targetHeight = (targetWidth * height) / width;

        BufferedImage resized =
                new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);

        Graphics2D g = resized.createGraphics();
        g.drawImage(
                src.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH),
                0, 0, null
        );
        g.dispose();

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

    private String uploadToCloudinary(BufferedImage image) throws Exception {

        File temp = File.createTempFile("thumb", ".jpg");

        try {

            writeCompressedJpeg(image, temp, 0.65f);

            Map uploadResult = cloudinary.uploader().upload(
                    temp,
                    ObjectUtils.asMap("folder", "dochub_thumbnails")
            );

            return uploadResult.get("secure_url").toString();

        } finally {
            temp.delete();
        }
    }

    private void writeCompressedJpeg(
            BufferedImage image,
            File output,
            float quality
    ) throws Exception {

        ImageWriter writer =
                ImageIO.getImageWritersByFormatName("jpg").next();

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