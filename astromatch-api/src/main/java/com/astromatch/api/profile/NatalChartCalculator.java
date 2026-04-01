package com.astromatch.api.profile;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Simplified tropical natal chart calculator.
 *
 * Uses mean planetary motions from a J2000 reference epoch (Jan 1.5, 2000).
 * Accuracy: Sun is exact, Moon ±1 sign, inner planets ±1 sign,
 * outer planets (Jupiter and beyond) correct for the sign.
 */
public final class NatalChartCalculator {

    private NatalChartCalculator() {}

    // -------------------------------------------------------------------------
    // Zodiac data
    // -------------------------------------------------------------------------

    private static final String[] SIGN_NAMES = {
        "Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge",
        "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"
    };

    private static final String[] SIGN_SYMBOLS = {
        "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"
    };

    // -------------------------------------------------------------------------
    // Planet reference data at J2000 epoch (Jan 1.5, 2000 = Julian day 2451545.0)
    // epoch_longitude: ecliptic tropical longitude in degrees
    // daily_motion:    mean daily motion in degrees/day
    // -------------------------------------------------------------------------

    private record Planet(String name, String symbol, double epochLongitude, double dailyMotion) {}

    private static final List<Planet> PLANETS = List.of(
        new Planet("Soleil",   "☀️",  280.46,  0.9856),
        new Planet("Lune",     "🌙",  218.32, 13.1764),
        new Planet("Mercure",  "☿",  252.25,  4.0923),
        new Planet("Vénus",    "♀",  180.98,  1.6021),
        new Planet("Mars",     "♂",  355.43,  0.5240),
        new Planet("Jupiter",  "♃",   34.40,  0.0831),
        new Planet("Saturne",  "♄",   49.94,  0.0335),
        new Planet("Uranus",   "♅",  312.55,  0.0117),
        new Planet("Neptune",  "♆",  302.88,  0.0060),
        new Planet("Pluton",   "♇",  252.89,  0.00397)
    );

    private static final LocalDate J2000 = LocalDate.of(2000, 1, 1);

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Builds a natal chart as a list of {@link NatalPlanetData} records.
     *
     * @param birthDate the birth date (required)
     * @return ordered list of 10 planets with their sign
     */
    public static List<NatalPlanetData> compute(LocalDate birthDate) {
        long days = ChronoUnit.DAYS.between(J2000, birthDate);

        return PLANETS.stream().map(p -> {
            double longitude = ((p.epochLongitude() + days * p.dailyMotion()) % 360 + 360) % 360;
            int signIdx = (int) (longitude / 30) % 12;
            return new NatalPlanetData(p.name(), p.symbol(), SIGN_NAMES[signIdx], SIGN_SYMBOLS[signIdx]);
        }).toList();
    }

    // -------------------------------------------------------------------------
    // DTO
    // -------------------------------------------------------------------------

    public record NatalPlanetData(String planet, String symbol, String sign, String signSymbol) {}
}
