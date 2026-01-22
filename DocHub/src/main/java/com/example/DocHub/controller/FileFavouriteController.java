package com.example.DocHub.controller;


import com.example.DocHub.dto.request.FileIdsRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.service.FileFavouriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class FileFavouriteController {

    private final FileFavouriteService favouriteService;

    /* ================= ADD TO FAVOURITES ================= */

    @PostMapping("/favourite")
    public ResponseEntity<ApiResponse<Void>> addToFavourite(
            @RequestBody FileIdsRequest request
    ) {
        favouriteService.addToFavourite(request.getFileIds());
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Added to favourites", null)
        );
    }

    /* ================= REMOVE FROM FAVOURITES ================= */

    @DeleteMapping("/favourite")
    public ResponseEntity<ApiResponse<Void>> removeFromFavourite(
            @RequestBody FileIdsRequest request
    ) {
        favouriteService.removeFromFavourite(request.getFileIds());
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Removed from favourites", null)
        );
    }
}
