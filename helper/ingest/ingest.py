import pandas as pd
import ast

RETRO_PLATFORMS = ["Atari 2600", "Atari 7800", "NES", "SNES",
                   "Sega Genesis", "Arcade", "Game Boy", "Commodore 64"]

def load_retro_games(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)


    for col in ["game_modes", "platforms", "genres"]:
        df[col] = df[col].apply(lambda x: ast.literal_eval(x) if pd.notna(x) else [])


    df = df[df["platforms"].apply(
        lambda p: any(platform in p for platform in RETRO_PLATFORMS)
    )]


    df = df[df["game_modes"].apply(lambda m: "Single player" in m)]


    df = df[["id", "name", "summary", "genres", "platforms", "game_modes"]].dropna(subset=["summary"])
    return df.reset_index(drop=True)