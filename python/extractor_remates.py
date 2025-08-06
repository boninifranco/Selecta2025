import fitz  # PyMuPDF
import pandas as pd
import re

def extraer_info_remate(ruta_pdf):
    """
    Función para extraer información de lotes de ganado de un catálogo en PDF.

    Args:
        ruta_pdf (str): La ruta al archivo PDF.

    Returns:
        pandas.DataFrame: Un DataFrame con la información de los lotes.
    """
    # Lista para almacenar los datos de cada lote
    datos_lotes = []
    
    # Abrimos el documento PDF
    doc = fitz.open(ruta_pdf)
    
    # Iteramos por las páginas donde está la información de los lotes (de la 8 a la 28 aprox.)
    for num_pagina in range(7, 28): 
        pagina = doc.load_page(num_pagina)
        texto_pagina = pagina.get_text("text")
        
        # Usamos expresiones regulares para encontrar todos los bloques de lotes en la página
        # Un bloque de lote comienza con "LOTE N°"
        bloques = re.split(r'LOTE N°\s\d+', texto_pagina)
        
        # Buscamos los números de lote para asociarlos a cada bloque
        numeros_lote = re.findall(r'LOTE N°\s(\d+)', texto_pagina)

        # El primer bloque es texto basura antes del primer lote, lo ignoramos
        for i, bloque in enumerate(bloques[1:]):
            lote_info = {}
            
            # Almacenamos el número de lote
            if i < len(numeros_lote):
                lote_info['Lote'] = numeros_lote[i].strip()

            # Función para buscar un patrón y devolver el valor encontrado
            def buscar_valor(patron, texto):
                busqueda = re.search(patron, texto, re.IGNORECASE)
                if busqueda:
                    # Limpiamos el texto extraído
                    return busqueda.group(1).replace('\n', ' ').strip()
                return None

            # Extracción de cada campo usando patrones (expresiones regulares)
            lote_info['Remitente'] = buscar_valor(r'Remitente:\s*(.*?)(?=\n[A-ZÁÉÍÓÚÑ\s]{5,}:|$)', bloque)
            lote_info['Ubicacion'] = buscar_valor(r'Ubicación:\s*(.*?)(?=\nDetalle:|$)', bloque)
            lote_info['Detalle'] = buscar_valor(r'Detalle:\s*(.*?)(?=\nPeso:|$)', bloque)
            lote_info['Peso'] = buscar_valor(r'Peso:\s*(.*?)(?=\n|$)', bloque)
            lote_info['Trazabilidad'] = buscar_valor(r'Trazabilidad:\s*(.*?)(?=\n|$)', bloque)
            lote_info['Plazos'] = buscar_valor(r'Plazos:\s*(.*?)(?=\n|$)', bloque)
            lote_info['Observaciones'] = buscar_valor(r'Observaciones:\s*(.*?)(?=\nPlazos:|\n[A-ZÁÉÍÓÚÑ\s]{5,}\s\(|$)', bloque)
            
            # Solo añadimos el lote si tiene información relevante
            if lote_info.get('Remitente'):
                datos_lotes.append(lote_info)

    # Creamos un DataFrame de Pandas con todos los datos
    df = pd.DataFrame(datos_lotes)
    
    return df

# --- EJECUCIÓN DEL SCRIPT ---
if __name__ == "__main__":
    nombre_archivo_pdf = "Orden de Venta Cañuelas.pdf"
    
    print(f"Iniciando la extracción de datos desde '{nombre_archivo_pdf}'...")
    
    # Llamamos a la función para extraer los datos
    remates_df = extraer_info_remate(nombre_archivo_pdf)
    
    # Guardamos los datos en un archivo CSV
    nombre_archivo_csv = "datos_remates.csv"
    remates_df.to_csv(nombre_archivo_csv, index=False, encoding='utf-8-sig')
    
    print(f"¡Extracción completa! ✅")
    print(f"Se encontraron {len(remates_df)} lotes.")
    print(f"Los datos se han guardado en el archivo '{nombre_archivo_csv}'.")