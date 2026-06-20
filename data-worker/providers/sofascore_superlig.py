import os
import logging
import pandas as pd
import soccerdata as sd

# Establish logger
logger = logging.getLogger("sofascore_superlig")

class SuperLigSofascore(sd.Sofascore):
    """
    SuperLigSofascore is a compatibility adapter subclassing soccerdata.Sofascore.
    It overrides read_leagues() to inject the verified tournament ID (52) for 
    the Trendyol Süper Lig when default discovery fails or is not present.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def read_leagues(self) -> pd.DataFrame:
        """
        Overrides the standard discovery mechanism to return the custom DataFrame 
        for Trendyol Süper Lig with the verified Sofascore tournament ID 52.
        It is fully self-protecting against timing/startup validation errors where
        self.leagues might not be set yet or soccerdata base discovery fails.
        """
        super_lig_df = pd.DataFrame([
            {
                "league": "TUR-Super Lig",
                "league_id": 52,
                "region": "TUR"
            }
        ]).set_index("league")
        super_lig_df["league_id"] = super_lig_df["league_id"].astype(int)

        try:
            # Attempt to fetch default leagues from soccerdata
            base_df = super().read_leagues()
            if base_df is not None and not base_df.empty:
                # Combine them, prioritizing the custom Super Lig ID
                if "TUR-Super Lig" in base_df.index:
                    base_df = base_df.drop("TUR-Super Lig")
                return pd.concat([super_lig_df, base_df])
        except Exception as e:
            # If the default read_leagues fails, we safely fall back to just Super Lig
            logger.warning(f"Soccerdata underlying read_leagues failed; using fallback custom leagues: {e}")
            pass

        return super_lig_df

def create_superlig_reader(season: str | None = None) -> SuperLigSofascore:
    """
    Factory function to initialize and return the SuperLigSofascore reader safely.
    Performs critical diagnostics loading logs prior and post initialization.
    """
    soccerdata_dir = os.environ.get("SOCCERDATA_DIR", "Not Set")
    file_path = __file__
    league_key = "TUR-Super Lig"
    tournament_id = 52
    class_name = "SuperLigSofascore"

    logger.info("=== DIAGNOSTIC PRE-INITIALIZATION ===")
    logger.info(f"Target SOCCERDATA_DIR: {soccerdata_dir}")
    logger.info(f"Provider file path: {file_path}")
    logger.info(f"Adapter League Key: {league_key}")
    logger.info(f"Adapter Tournament ID: {tournament_id}")
    logger.info(f"Reader Class Name: {class_name}")
    logger.info("Initializing reader...")

    # Instantiation
    reader = SuperLigSofascore(
        leagues=league_key,
        seasons=season or "2025-26"
    )

    logger.info("=== DIAGNOSTIC POST-INITIALIZATION ===")
    logger.info(f"Successfully initialized: {reader.__class__.__name__}")
    logger.info(f"Selected leagues: {getattr(reader, 'leagues', None)}")
    logger.info(f"Selected seasons: {getattr(reader, 'seasons', None)}")
    logger.info("======================================")

    return reader
