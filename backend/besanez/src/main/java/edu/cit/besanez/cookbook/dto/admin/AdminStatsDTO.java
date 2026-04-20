package edu.cit.besanez.cookbook.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {

    // ─── Totals ───────────────────────────────────────────────────────────────
    private long totalUsers;
    private long totalRecipes;
    private long totalCollections;
    private long publicRecipes;
    private long privateRecipes;

    // ─── Recent activity ──────────────────────────────────────────────────────
    private long newUsersLast7Days;
    private long newUsersLast30Days;
    private long newRecipesLast7Days;
    private long newRecipesLast30Days;

    // ─── Chart data ───────────────────────────────────────────────────────────
    /**
     * Daily new-user counts for the last 30 days: [{date: "2025-01-01", count: 3},
     * ...]
     */
    private List<Map<String, Object>> userGrowthLast30Days;

    /** Daily new-recipe counts for the last 30 days */
    private List<Map<String, Object>> recipeGrowthLast30Days;

    // ─── Top lists ────────────────────────────────────────────────────────────
    private List<RecentUserDTO> recentUsers;
    private List<RecentRecipeDTO> recentRecipes;

    // ─── Nested DTOs ─────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentUserDTO {
        private long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String profileImage;
        private String cookingLevel;
        private String joinedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentRecipeDTO {
        private long recipeId;
        private String name;
        private String imageUrl;
        private boolean isPublic;
        private String ownerFirstName;
        private String ownerLastName;
        private String ownerEmail;
        private String createdAt;
    }
}