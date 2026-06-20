import pandas as pd
import soccerdata as sd

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
        """
        # Safely resolve requested leagues from instance attributes
        requested_leagues = []
        if hasattr(self, "leagues"):
            if isinstance(self.leagues, (list, set, tuple)):
                requested_leagues = list(self.leagues)
            elif isinstance(self.leagues, str):
                requested_leagues = [self.leagues]

        if "TUR-Super Lig" in requested_leagues:
            df = pd.DataFrame([
                {
                    "league": "TUR-Super Lig",
                    "league_id": 52,
                    "region": "TUR"
                }
            ]).set_index("league")
            df["league_id"] = df["league_id"].astype(int)
            return df

        # Fallback to standard soccerdata behavior if a different league is queried
        return super().read_leagues()
