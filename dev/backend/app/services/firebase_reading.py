import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime
import dotenv
import os

dotenv.load_dotenv()

class FirestoreEncoder(json.JSONEncoder):
    """
    Firestoreの特殊データ型をJSONシリアライズ可能な形式に変換するカスタムエンコーダ
    
    Attributes:
        継承: json.JSONEncoder
    """
    def default(self, obj):
        """
        特殊なデータ型を変換するメソッド
        
        Args:
            obj: 変換対象のオブジェクト
            
        Returns:
            シリアライズ可能な形式に変換されたデータ
        """
        # DatetimeWithNanoseconds → ISOフォーマット文字列
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
            
        # バイナリデータ → UTF-8文字列
        if isinstance(obj, bytes):
            return obj.decode('utf-8')
            
        # その他の型はデフォルト処理
        return super().default(obj)

def get_all_news_json(region_id, page_size=100, last_doc=None):
    """
    指定されたRegionID配下の全ニュースデータを取得
    
    Args:
        region_id (str): 地域ID
        page_size (int): 1ページあたりの取得件数（デフォルト100）
        last_doc (str): 前回取得最後のドキュメントID（ページネーション用）
        
    Returns:
        str: JSON形式の文字列
    """
    try:
        # Firebase初期化（シングルトンパターン）
        if not firebase_admin._apps:
            cred = credentials.Certificate(
                {
                    "type": os.getenv("FIREBASE_TYPE"),
                    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace(
                        "\\n", "\n"
                    ),
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
                    "auth_provider_x509_cert_url": os.getenv(
                        "FIREBASE_AUTH_PROVIDER_X509_CERT_URL"
                    ),
                    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
                    "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN"),
                }
            )
            firebase_admin.initialize_app(cred)

        # Firestoreクライアント初期化
        db = firestore.client()
        
        # Newsサブコレクション参照取得
        news_collection = (
            db.collection('Regions')
            .document(region_id)
            .collection('News')  # サブコレクション参照
        )
        
        # クエリ構築
        query = news_collection.order_by('__name__').limit(page_size)
        
        # ページネーション処理（前回取得位置から再開）
        if last_doc:
            last_snapshot = news_collection.document(last_doc).get()
            query = query.start_after(last_snapshot)

        # ドキュメント取得
        docs = query.stream()
        
        # データ変換処理
        news_data = [
            {"id": doc.id, **doc.to_dict()}  # ドキュメントIDを追加
            for doc in docs
        ]
        
        # 次ページ用カーソル
        next_cursor = news_data[-1]['id'] if news_data else None

        # JSON形式に変換
        return json.dumps(
            {
                "region_id": region_id,
                "news": news_data,
                "next_cursor": next_cursor
            },
            ensure_ascii=False,  # 非ASCII文字対応
            indent=2,  # 可読性のためインデント
            cls=FirestoreEncoder  # カスタムエンコーダ適用
        )

    except Exception as e:
        # エラー処理
        return json.dumps(
            {
                "error": str(e),
                "type": type(e).__name__,
                "region_id": region_id
            },
            ensure_ascii=False
        )

# 使用例 ---------------------------------------------------
if __name__ == "__main__":
    # 地域ID指定（実際のIDに置き換える）
    region_id = "ugyGiVvlg4fDN2afMnoe(RegionID)"
    
    # 可変式でニュース取得件数を指定
    page_size = 50  # 例えば50件取得したい場合
    
    # 全ニュースデータ取得（初回）
    result = get_all_news_json(region_id, page_size=page_size)
    print("取得結果:")
    print(result)


"""
Copyright (c) 2025 YukiTakayama, SaihaHatanaka, ShingoNakano
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""