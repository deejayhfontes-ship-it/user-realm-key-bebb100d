"""
Agente de criação de artes com referências e sobreposição de texto

Este script implementa um fluxo automatizado para gerar uma arte base a partir de
referências de uma secretaria e tipo de material, compor um prompt para um
modelo generativo e, em seguida, sobrepor texto com a fonte institucional
especificada.  Ele foi projetado para funcionar com a estrutura de pastas
descrita no plano anterior e utiliza a biblioteca Pillow para manipulação
de imagens.

Uso:
    python agente.py <secretaria> <material> <tema> <texto>

Exemplo:
    python agente.py educacao banner "campanha de matrícula" "Inscreva-se já!"

Nota: Este script cria uma imagem base simples usando a cor primária das
referências, pois não há integração direta com um modelo generativo aqui.
Você pode adaptar a função ``generate_base_image`` para integrar com seu
serviço de IA (por exemplo, Google Gemini) e fornecer a imagem gerada como
entrada para a etapa de sobreposição de texto.
"""

import argparse
import base64
import json
import os
from typing import Dict, List, Optional, Tuple

from PIL import Image, ImageDraw, ImageFont


def load_references(secretaria: str, material: str, root: str = "referencias") -> Tuple[Dict[str, str], List[str], Optional[str], List[str], List[str]]:
    """Carrega referências de cores, fontes, logotipo e imagens de apoio para a secretaria/material.

    Args:
        secretaria: nome da secretaria (sem prefixo ``secretaria_``)
        material: tipo de material (ex.: banner, cartaz)
        root: diretório raiz onde estão armazenadas as pastas de referências

    Returns:
        Uma tupla com (cores, fontes, logotipo, layouts, imagens de referência).

        * cores: dicionário com nomes de cores e códigos hexadecimais (string).
        * fontes: lista de caminhos de arquivo de fontes (.ttf ou .otf).
        * logotipo: caminho para o logotipo (str ou None se não existir).
        * layouts: lista de caminhos de imagens de layout.
        * imagens: lista de caminhos de imagens de referência.

    Levanta FileNotFoundError se a pasta não existir.
    """
    base_path = os.path.join(root, f"secretaria_{secretaria}", material)
    if not os.path.isdir(base_path):
        raise FileNotFoundError(f"Pasta de referências não encontrada: {base_path}")

    # Cores
    cores: Dict[str, str] = {}
    cores_path = os.path.join(base_path, "cores.json")
    if os.path.isfile(cores_path):
        with open(cores_path, "r", encoding="utf-8") as f:
            try:
                cores = json.load(f)
            except json.JSONDecodeError:
                print(f"Aviso: arquivo de cores {cores_path} não é um JSON válido. Ignorando.")

    # Fontes
    fontes_dir = os.path.join(base_path, "fontes")
    fontes: List[str] = []
    if os.path.isdir(fontes_dir):
        for fname in os.listdir(fontes_dir):
            if fname.lower().endswith((".ttf", ".otf")):
                fontes.append(os.path.join(fontes_dir, fname))

    # Logotipo
    logo_path = None
    for fname in ["logotipo.png", "logo.png", "logotipo.jpg"]:
        candidate = os.path.join(base_path, fname)
        if os.path.isfile(candidate):
            logo_path = candidate
            break

    # Layouts
    layouts_dir = os.path.join(base_path, "layout")
    layouts: List[str] = []
    if os.path.isdir(layouts_dir):
        for fname in os.listdir(layouts_dir):
            if fname.lower().endswith((".png", ".jpg", ".jpeg")):
                layouts.append(os.path.join(layouts_dir, fname))

    # Imagens de referência adicionais
    imagens_dir = os.path.join(base_path, "imagens_referencia")
    imagens: List[str] = []
    if os.path.isdir(imagens_dir):
        for fname in os.listdir(imagens_dir):
            if fname.lower().endswith((".png", ".jpg", ".jpeg")):
                imagens.append(os.path.join(imagens_dir, fname))

    return cores, fontes, logo_path, layouts, imagens


def build_prompt(secretaria: str, material: str, tema: str, cores: Dict[str, str], fontes: List[str], layout_count: int) -> str:
    """Monta um prompt textual com base nas referências.

    Args:
        secretaria: nome da secretaria
        material: tipo de material
        tema: tema ou mensagem principal a ser transmitida
        cores: dicionário de cores
        fontes: lista de fontes disponíveis
        layout_count: quantidade de layouts de referência encontrados

    Returns:
        Uma string de prompt descritivo que pode ser usada por um modelo generativo.
    """
    # Descrição das cores
    cores_desc = ", ".join([f"{nome} {codigo}" for nome, codigo in cores.items()]) if cores else "cores institucionais"
    # Descrição de fontes (apenas nomes, não os arquivos)
    fontes_desc = ", ".join([os.path.splitext(os.path.basename(f))[0] for f in fontes]) if fontes else "tipografia institucional"
    # Descrição do layout
    if layout_count > 0:
        layout_desc = f"use a composição semelhante às imagens de layout fornecidas (quantidade: {layout_count}), com disposição equilibrada de imagens e texto"
    else:
        layout_desc = "use uma diagramação harmoniosa e moderna"

    prompt = (
        f"Crie um(a) {material} para a Secretaria de {secretaria.replace('_', ' ').title()} "
        f"com o tema: {tema}. "
        f"Utilize as cores {cores_desc} e tipografia similar a {fontes_desc}. "
        f"{layout_desc}. "
        "Inclua elementos visuais que remetam às atividades da secretaria e mantenha a originalidade da arte."
    )
    return prompt


def generate_base_image(prompt: str, cores: Dict[str, str], size: Tuple[int, int] = (1024, 768)) -> Image.Image:
    """Gera uma imagem base.

    Esta implementação gera uma imagem sólida usando a cor primária fornecida. Em
    um cenário real, você deve chamar seu modelo de IA aqui passando o prompt
    e outras referências.

    Args:
        prompt: prompt textual para o modelo de IA (não usado aqui)
        cores: dicionário de cores, onde a primeira cor será usada como fundo
        size: tamanho da imagem

    Returns:
        Uma instância de PIL.Image com a cor primária.
    """
    # Escolhe a primeira cor ou um padrão caso não exista
    if cores:
        first_color_code = next(iter(cores.values()))
        # Remove o '#' se presente
        first_color_code = first_color_code.lstrip('#')
        # Converte hexadecimal para RGB
        try:
            rgb = tuple(int(first_color_code[i:i + 2], 16) for i in (0, 2, 4))
        except ValueError:
            rgb = (200, 200, 200)
    else:
        rgb = (200, 200, 200)

    image = Image.new("RGB", size, rgb)
    return image


def overlay_text(
    image: Image.Image,
    texto: str,
    font_paths: List[str],
    cores: Dict[str, str],
    margin: int = 50,
) -> Image.Image:
    """Sobrepõe texto na imagem usando a primeira fonte disponível.

    Args:
        image: imagem base gerada pelo modelo ou por ``generate_base_image``
        texto: texto a ser inserido
        font_paths: lista de caminhos de fontes disponíveis
        cores: dicionário de cores para definir a cor do texto (usa 'primary' ou a primeira cor)
        margin: margem inferior para posicionar o texto

    Returns:
        Uma nova imagem com o texto sobreposto.
    """
    # Seleciona a cor de texto (contraste simples: branco ou a primeira cor invertida)
    if cores:
        first_color_code = next(iter(cores.values())).lstrip('#')
        try:
            rgb = tuple(int(first_color_code[i:i + 2], 16) for i in (0, 2, 4))
            # Usa cor branca se o fundo for escuro e preta se o fundo for claro
            brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
            text_color = (0, 0, 0) if brightness > 186 else (255, 255, 255)
        except ValueError:
            text_color = (255, 255, 255)
    else:
        text_color = (255, 255, 255)

    draw = ImageDraw.Draw(image)
    width, height = image.size

    # Tenta carregar a primeira fonte; caso contrário, usa fonte padrão
    font = None
    for font_path in font_paths:
        try:
            font = ImageFont.truetype(font_path, size=48)
            break
        except Exception:
            continue
    if font is None:
        font = ImageFont.load_default()

    # Quebra de linha simples se o texto for muito longo
    max_width = int(width * 0.8)
    lines: List[str] = []
    if draw.textlength(texto, font=font) <= max_width:
        lines.append(texto)
    else:
        words = texto.split()
        current_line = ""
        for word in words:
            test_line = f"{current_line} {word}".strip()
            if draw.textlength(test_line, font=font) <= max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)

    # Calcula altura total do texto
    total_text_height = 0
    line_heights: List[int] = []
    for line in lines:
        _, line_height = draw.textsize(line, font=font)
        line_heights.append(line_height)
        total_text_height += line_height

    # Posição inicial (centralizado horizontalmente, acima da margem inferior)
    y = height - total_text_height - margin
    for i, line in enumerate(lines):
        line_width = draw.textlength(line, font=font)
        x = (width - line_width) / 2
        draw.text((x, y), line, fill=text_color, font=font)
        y += line_heights[i]

    return image


def main() -> None:
    parser = argparse.ArgumentParser(description="Gerador de artes com referências e sobreposição de texto")
    parser.add_argument("secretaria", help="nome da secretaria (ex.: educacao, saude)")
    parser.add_argument("material", help="tipo de material (ex.: banner, cartaz)")
    parser.add_argument("tema", help="tema ou mensagem principal para a arte")
    parser.add_argument("texto", help="texto que será sobreposto na arte final")
    parser.add_argument("--root", default="referencias", help="diretório onde estão as referências")
    parser.add_argument("--output", default=None, help="caminho para salvar a arte final (png)")
    args = parser.parse_args()

    # Carrega referências
    try:
        cores, fontes, logo, layouts, imagens = load_references(args.secretaria, args.material, root=args.root)
    except FileNotFoundError as e:
        print(str(e))
        return

    # Constrói o prompt
    prompt = build_prompt(args.secretaria, args.material, args.tema, cores, fontes, len(layouts))
    print("Prompt gerado:\n", prompt)

    # Gera imagem base (pode ser substituído por integração com IA)
    base_image = generate_base_image(prompt, cores)

    # Sobrepõe texto
    final_image = overlay_text(base_image, args.texto, fontes, cores)

    # Define caminho de saída
    output_path = args.output
    if output_path is None:
        output_path = f"arte_{args.secretaria}_{args.material}.png"

    # Salva a imagem
    final_image.save(output_path)
    print(f"Arte final salva em: {output_path}")


if __name__ == "__main__":
    main()