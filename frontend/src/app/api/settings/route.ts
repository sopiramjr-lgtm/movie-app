import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "site-settings.json");

const DEFAULT_SETTINGS = {
  hero: {
    title: "Welcome to KhmerFlix",
    subtitle: "Stream unlimited movies and TV series in Cambodia.",
    button: "Start Watching",
    bg: "https://image.tmdb.org/t/p/original/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg",
  },
  footer: {
    about: "KhmerFlix is the leading streaming platform in Cambodia.",
    email: "support@khmerflix.com",
    phone: "+855 12 345 678",
    fb: "https://facebook.com",
    tw: "https://twitter.com",
  },
};

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading site settings:", err);
  }
  return DEFAULT_SETTINGS;
}

function writeSettings(data: any) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving site settings:", err);
    return false;
  }
}

export async function GET() {
  const settings = readSettings();
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const current = readSettings();
    const updated = {
      hero: { ...current.hero, ...(body.hero || {}) },
      footer: { ...current.footer, ...(body.footer || {}) },
    };

    const saved = writeSettings(updated);
    if (!saved) {
      return NextResponse.json({ success: false, message: "Failed to write settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully", data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
