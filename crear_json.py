import csv
import json

def generar_json_definitivo(ruta_csv):
    """
    Lee el CSV de forma robusta usando el módulo 'csv' y lo convierte
    al formato JSON que la aplicación web necesita.
    """
    try:
        # Usaremos el módulo 'csv' que maneja las comas internas sin problemas
        with open(ruta_csv, mode='r', encoding='utf-8-sig') as f:
            # DictReader lee cada fila y la convierte en un diccionario
            csv_reader = csv.DictReader(f)
            
            lista_para_json = []
            
            for fila in csv_reader:
                # Accedemos a los datos por el nombre de la columna
                lote_num = fila.get('Lote', '').strip()
                categoria = fila.get('Categoria', '').strip()
                link_youtube = fila.get('Link_Youtube', '').strip()

                # Extraemos el ID del video del link que tengas
                # Esto es un ejemplo, necesitarás los links reales
                video_id = link_youtube.split('/')[-1]

                # Saltamos filas que no tengan un videoID válido
                if not video_id:
                    continue

                bovino_obj = {
                    "name": f"Lote {lote_num} ({categoria})",
                    "youtube_video_id": video_id,
                    # URL de miniatura correcta y estándar
                    "thumbnail_image": f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
                }
                
                lista_para_json.append(bovino_obj)

    except FileNotFoundError:
        print(f"Error: No se encontró el archivo '{ruta_csv}'.")
        return None
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")
        return None

    # Guardamos la lista de objetos en un archivo .json
    nombre_archivo_json = 'bovinos_youtube_data.json'
    with open(nombre_archivo_json, 'w', encoding='utf-8') as f:
        json.dump(lista_para_json, f, ensure_ascii=False, indent=4)
        
    print(f"✅ ¡Éxito! Se ha creado el archivo '{nombre_archivo_json}' con {len(lista_para_json)} lotes.")
    return lista_para_json

# --- EJECUCIÓN DEL SCRIPT ---
if __name__ == "__main__":
    csv_completo = "datos_finales_completos.csv" 
    generar_json_definitivo(csv_completo)