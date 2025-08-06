import requests
from bs4 import BeautifulSoup
import json
import re

def get_youtube_video_id(url):
    """
    Extrae el ID de video de una URL de YouTube.
    Soporta formatos como:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    """
    if "youtube.com/watch?v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "youtube.com/embed/" in url:
        return url.split("embed/")[1].split("?")[0]
    return None

def scrape_casamu_catalogo():
    base_url = "https://www.casamu.com.ar/"
    catalogo_url = base_url + "catalogo-semen/"
    bovinos_data = []

    print(f"Scrapeando catálogo: {catalogo_url}")
    try:
        response = requests.get(catalogo_url)
        response.raise_for_status() # Lanza una excepción para errores HTTP
        soup = BeautifulSoup(response.text, 'html.parser')

        # *** CAMBIO AQUÍ: Buscar los elementos que contienen la información de cada bovino ***
        # Ahora parecen ser <div> con las clases 'wpb_single_image wpb_content_element vc_align_left'
        # Estos divs están dentro de un div padre con la clase 'wpb_wrapper' (o una fila de Visual Composer)
        
        # Primero, intenta encontrar la fila contenedora, si existe
        # A veces, estos elementos están directamente bajo un div.wpb_wrapper o un div.vc_column-inner
        # O incluso un div.vc_row
        
        # Una forma más robusta es buscar directamente los elementos de imagen individuales
        bovino_items = soup.find_all('div', class_='wpb_single_image wpb_content_element vc_align_left')

        if not bovino_items:
            print("No se encontraron elementos de bovinos con las clases 'wpb_single_image wpb_content_element vc_align_left'.")
            print("Revisa la estructura de la página 'catalogo-semen/'.")
            return []

        for item in bovino_items:
            bovino = {}

            # Extraer el enlace a la página de detalle del bovino
            # Está en el atributo 'href' de la etiqueta <a> dentro de <figure class="wpb_wrapper vc_figure">
            link_tag = item.find('a', class_='vc_single_image-wrapper')
            if link_tag and 'href' in link_tag.attrs:
                detail_page_url = link_tag['href']
                bovino['detail_url'] = detail_page_url
            else:
                print(f"Advertencia: No se encontró el enlace de detalle para un item. Saltando.")
                continue

            # Extraer el nombre del bovino
            # Está en <h2> con la clase 'wpb_heading wpb_singleimage_heading'
            name_tag = item.find('h2', class_='wpb_heading wpb_singleimage_heading')
            if name_tag:
                bovino['name'] = name_tag.get_text(strip=True)
            else:
                bovino['name'] = 'Nombre desconocido'

            # Extraer la imagen del bovino (thumbnail)
            # Está en <img> con la clase 'vc_single_image-img'
            img_tag = item.find('img', class_='vc_single_image-img')
            if img_tag and 'src' in img_tag.attrs:
                # Usar la URL base de la imagen, no la srcset completa si tiene muchas resoluciones
                bovino['thumbnail_image'] = img_tag['src']
            else:
                bovino['thumbnail_image'] = '' # Si no se encuentra, dejar vacío

            # Ahora, ir a la página de detalle para obtener el primer video de YouTube
            youtube_url = None
            if bovino['detail_url']:
                print(f"  Scrapeando página de detalle: {bovino['detail_url']}")
                try:
                    detail_response = requests.get(bovino['detail_url'])
                    detail_response.raise_for_status()
                    detail_soup = BeautifulSoup(detail_response.text, 'html.parser')

                    found_youtube_link = False
                    
                    # Primero, buscar iframes de YouTube que son muy comunes para embebidos
                    for iframe in detail_soup.find_all('iframe', src=True):
                        src = iframe['src']
                        if "youtube.com/embed/" in src or "youtube-nocookie.com/embed/" in src:
                            youtube_url = src
                            found_youtube_link = True
                            break

                    # Si no encontramos un iframe, buscar enlaces <a>
                    if not found_youtube_link:
                        for link in detail_soup.find_all('a', href=True):
                            href = link['href']
                            if "youtube.com/watch?v=" in href or "youtu.be/" in href:
                                youtube_url = href
                                found_youtube_link = True
                                break
                    
                    if youtube_url:
                        bovino['youtube_url'] = youtube_url
                        bovino['youtube_video_id'] = get_youtube_video_id(youtube_url)
                    else:
                        print(f"    No se encontró enlace/iframe de YouTube en {bovino['detail_url']}")
                        bovino['youtube_url'] = ''
                        bovino['youtube_video_id'] = ''

                except requests.exceptions.RequestException as e:
                    print(f"    Error al acceder a la página de detalle {bovino['detail_url']}: {e}")
                    bovino['youtube_url'] = ''
                    bovino['youtube_video_id'] = ''

            bovinos_data.append(bovino)
    except requests.exceptions.RequestException as e:
        print(f"Error al acceder a la URL del catálogo {catalogo_url}: {e}")
    
    return bovinos_data

if __name__ == "__main__":
    scraped_data = scrape_casamu_catalogo()
    
    with open('bovinos_youtube_data.json', 'w', encoding='utf-8') as f:
        json.dump(scraped_data, f, ensure_ascii=False, indent=4)
    
    print("\nScraping completado. Datos guardados en 'bovinos_youtube_data.json'")
    print(f"Se encontraron {len(scraped_data)} bovinos.")
    for bovino in scraped_data:
        print(f"  - {bovino.get('name', 'N/A')}: {bovino.get('youtube_url', 'No YouTube URL')}")