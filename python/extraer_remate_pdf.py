import fitz  # PyMuPDF
import re
import json

def extract_youtube_id(url):
    return url.split("/")[-1]

def parse_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

def clean_field(value, default="N/A"):
    return value.strip() if value and value.strip() else default

def build_data(text):
    lotes = []
    
    # Dividir en bloques por "LOTE N°"
    raw_blocks = re.split(r"LOTE N°", text)
    
    for block in raw_blocks[1:]:  # Saltar la primera parte vacía
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        
        if len(lines) < 6:
            continue
        
        lote_num = lines[0].split()[0]  # Primer número después de LOTE N°
        remitente = clean_field(lines[1])
        ubicacion = clean_field(lines[2])
        detalle = clean_field(lines[3])
        peso = clean_field(lines[4])
        
        # Buscar URL YouTube en el bloque completo
        youtube_match = re.search(r"https:\/\/youtu\.be\/[A-Za-z0-9_\-]+", block)
        youtube_url = youtube_match.group(0) if youtube_match else ""
        youtube_id = extract_youtube_id(youtube_url) if youtube_url else "N/A"
        
        name = f"LOTE N° {lote_num} - {remitente}"
        detail_text = f"{detalle} | {peso} | {ubicacion}"
        
        placeholder_img = f"https://via.placeholder.com/300x200?text=Lote+{lote_num}"
        
        lotes.append({
            "name": name,
            "thumbnail_image": placeholder_img,
            "youtube_url": f"https://www.youtube.com/embed/{youtube_id}" if youtube_id != "N/A" else "",
            "youtube_video_id": youtube_id,
            "detail": detail_text
        })
    
    return lotes

if __name__ == "__main__":
    pdf_path = "Orden de Venta Canuelas.pdf" # Ajusta la ruta aquí
    text = parse_pdf(pdf_path)
    data = build_data(text)
    
    with open("bovinos_youtube_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"✅ Generado bovinos_youtube_data.json con {len(data)} lotes.")
