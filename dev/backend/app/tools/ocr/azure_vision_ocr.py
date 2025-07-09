from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from PIL import Image
import io
import os
from dotenv import load_dotenv

load_dotenv()

class AzureVisionOCR:
    def __init__(self):
        # Azureのエンドポイントとキーを.envから読み込み
        endpoint = os.getenv("AZURE_COMPUTER_VISION_ENDPOINT")
        key = os.getenv("AZURE_COMPUTER_VISION_KEY")

        if not endpoint or not key:
            raise RuntimeError("AZURE_COMPUTER_VISION_ENDPOINT または AZURE_COMPUTER_VISION_KEY が設定されていません")

        self.client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(key))

    def image_to_text(self, pil_image: Image.Image) -> str:
        # PIL画像をバイト配列に変換（JPEG推奨）
        buffered = io.BytesIO()
        pil_image.save(buffered, format="JPEG")
        content = buffered.getvalue()

        # Azure Computer Visionのread APIは非同期なので処理開始
        read_response = self.client.read_in_stream(io.BytesIO(content), raw=True)

        # ジョブIDを取得
        operation_location = read_response.headers["Operation-Location"]
        operation_id = operation_location.split("/")[-1]

        # 処理完了までポーリング（最大30秒程度）
        import time
        for _ in range(30):
            result = self.client.get_read_result(operation_id)
            if result.status.lower() not in ['notstarted', 'running']:
                break
            time.sleep(1)

        if result.status != 'succeeded':
            raise RuntimeError(f"Azure OCR failed with status: {result.status}")

        # テキスト抽出
        lines = []
        for page in result.analyze_result.read_results:
            for line in page.lines:
                lines.append(line.text)

        return "\n".join(lines)
