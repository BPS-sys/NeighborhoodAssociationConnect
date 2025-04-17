
from datetime import datetime
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials, firestore


# Firebaseの初期化
def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(r"Firebase_地域共生ID.json")
        firebase_admin.initialize_app(cred)
        return firestore.client()

# 情報の追加
def add_news(db, region_id):
    """ニュースを追加する関数（カスタムID対応版）"""
    try:
        news_ref = db.collection('Regions').document(region_id).collection('News')
        
        # カスタムID入力判定
        use_custom_id = input("カスタムIDを使用しますか？ (y/N): ").lower() == 'y'
        custom_id = None
        
        if use_custom_id:
            custom_id = input("設定するIDを入力してください: ").strip()
            if not custom_id:
                raise ValueError("IDが空です")

        # ニュース情報入力
        title = input("ニュースタイトルを入力: ")
        text = input("本文を入力: ")
        current_time = datetime.now()

        # データ構造（フィールド名統一）
        news_data = {
            'Title': title,
            'Text': text,          # フィールド名をtextに統一
            'Time': current_time,
        }

        # ID処理分岐
        if use_custom_id:
            # カスタムIDで登録
            doc_ref = news_ref.document(custom_id)
            doc_ref.set(news_data)
            result_id = custom_id
        else:
            # 自動生成IDで登録
            new_doc = news_ref.add(news_data)[1]  # add()は(ref, result)を返す
            result_id = new_doc.id

        # 結果表示
        print(f"\nニュースを追加しました！")
        print(f"id: {result_id}")
        print(f"Title: {title}")
        print(f"Time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")

        return result_id

    except Exception as e:
        print(f"\nエラーが発生しました: {type(e).__name__} - {str(e)}")
        return None

def edit_news(db, region_id):
    """ニュース記事を編集する関数"""
    try:
        doc_id = input("編集するニュースIDを入力: ")

        # ドキュメント参照取得
        news_ref = db.collection('Regions').document(region_id).collection('News').document(doc_id)
        
        # 既存データ取得
        doc = news_ref.get()
        if not doc.exists:
            print(f"エラー: {doc_id} は存在しません")
            return

        # 現在のデータ表示
        current_data = doc.to_dict()
        print("\n【現在の情報】")
        print(f"Title: {current_data.get('Title', '')}")
        print(f"Text: {current_data.get('Text', '')}\n")

        # 新しいデータ入力
        new_title = input("新しいタイトル（未変更の場合はEnter）: ") or current_data.get('title')
        new_text = input("新しい本文（未変更の場合はEnter）: ") or current_data.get('text')

        # 更新処理
        update_data = {
            'Title': new_title,
            'Text': new_text,
            'Time': datetime.now()
        }
        news_ref.update(update_data)
        
        print("\nニュースが正常に更新されました")

    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")

#ニュースIDで削除する情報を指定し、削除
def delete_news(db, region_id):
    news_collection = db.collection('Regions').document(region_id).collection('News')
    doc_id = input("Enter the document ID to delete: ")
    news_collection.document(doc_id).delete()
    print("News deleted successfully.")

def main():
    region_id = "ugyGiVvlg4fDN2afMnoe(RegionID)" #情報を取得する地域を指定。
    db = initialize_firebase()

    #どんな操作を行うのかを選択。
    while True:
        print("\n以下の選択肢を半角数字で入力:")
        print("1. 追加")
        print("2. 編集")
        print("3. 削除")
        print("4. 終了")
        choice = input("Enter your choice (1/2/3/4): ")
        choice = str(choice)
        
        if choice == '1':
            add_news(db, region_id)
        elif choice == '2':
            edit_news(db, region_id)
        elif choice == '3':
            delete_news(db, region_id)
        elif choice == '4':
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == '__main__':
    main()
