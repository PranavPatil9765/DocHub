package com.example.DocHub.service;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.apache.http.entity.ContentType;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

import javax.imageio.*;
import javax.imageio.stream.ImageOutputStream;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.OutputStream;
import java.util.List;
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

    String url = "https://lor-service-pdfthumbnail.vercel.app/pdf?optimize=true";

    try (CloseableHttpClient client = HttpClients.createDefault()) {

        HttpPost post = new HttpPost(url);

        MultipartEntityBuilder builder = MultipartEntityBuilder.create();

        builder.addBinaryBody(
                "file",                    // form field name
                pdfFile,                   // actual file
                ContentType.create("application/pdf"),
                pdfFile.getName()          // filename
        );

        post.setEntity(builder.build());

        try (CloseableHttpResponse response = client.execute(post)) {

            int status = response.getStatusLine().getStatusCode();

            if (status != 200) {
                throw new RuntimeException("Thumbnail API failed: " + status);
            }

            byte[] imageBytes = EntityUtils.toByteArray(response.getEntity());

            return uploadToCloudinary(imageBytes);
        }
    }
}
private String generateImageThumbnail(File imageFile) throws Exception {

    BufferedImage image = ImageIO.read(imageFile);
    if (image == null) return null;

    BufferedImage resized = resize(image, 400);

    ByteArrayOutputStream baos = new ByteArrayOutputStream();

    writeCompressedJpeg(resized, baos, 0.65f);

    byte[] imageBytes = baos.toByteArray();

    return uploadToCloudinary(imageBytes);
}

    /* ---------------- HELPERS ---------------- */

    private BufferedImage resize(BufferedImage src, int targetWidth) {

        int width = src.getWidth();
        int height = src.getHeight();

        int targetHeight = (targetWidth * height) / width;

        BufferedImage resized = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);

        Graphics2D g = resized.createGraphics();
        g.drawImage(
                src.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH),
                0, 0, null);
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
                height - (cropTop + cropBottom));
    }

    private BufferedImage cropTopOnly(BufferedImage src) {

        int width = src.getWidth();
        int height = src.getHeight();

        int topHeight = (int) (height * 0.45);

        return src.getSubimage(0, 0, width, topHeight);
    }

    private String uploadToCloudinary(byte[] imageBytes) throws Exception {

    Map uploadResult = cloudinary.uploader().upload(
            imageBytes,
            ObjectUtils.asMap(
                    "folder", "dochub_thumbnails",
                    "resource_type", "image"
            )
    );

    return uploadResult.get("secure_url").toString();
}

     private void writeCompressedJpeg(
        BufferedImage image,
        OutputStream outputStream,
        float quality) throws Exception {

    ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();

    ImageWriteParam param = writer.getDefaultWriteParam();
    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
    param.setCompressionQuality(quality);

    try (ImageOutputStream ios = ImageIO.createImageOutputStream(outputStream)) {
        writer.setOutput(ios);
        writer.write(null, new IIOImage(image, null, null), param);
    }

    writer.dispose();
}
}