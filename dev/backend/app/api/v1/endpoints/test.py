import requests
import random

BASE_URL = "http://localhost:8080"
region_id = "ugyGiVvlg4fDN2afMnoe(RegionID)"  # 適宜変更
url = f"{BASE_URL}/api/v1/regions/{region_id}/news"
headers = {"Content-Type": "application/json"}

data_templates = {
    "防犯": [
        # 元の5件（略）

        ("通学路の安全点検実施", "児童の通学路における安全点検を実施します。危険箇所などありましたら町内会までご連絡ください。"),
        ("街灯の故障報告について", "○丁目付近の街灯が一部故障しております。夜間の通行には十分ご注意ください。"),
        ("車上荒らしに注意", "今週、駐車中の車両からの盗難被害が報告されています。貴重品は車内に置かないようにしましょう。"),
        ("防犯ブザー配布のご案内", "小学生向けの防犯ブザーを町内会で配布しております。ご希望の方は平日午後にお越しください。"),
        ("防犯カメラの設置完了", "町内の主要箇所に防犯カメラを設置しました。安心して暮らせるまちづくりを進めています。"),
    ],
    "防災": [
        # 元の5件（略）

        ("非常持出袋の見直しを", "災害時に備えて非常持出袋の中身を今一度ご確認ください。リストを掲示板にも掲載しています。"),
        ("防災倉庫の整備完了", "町内の防災倉庫の整備が完了しました。消火器・発電機等の備品を点検しています。"),
        ("土砂災害警戒情報発令", "○○山周辺に土砂災害の恐れがあります。大雨の際は早めの避難を心がけてください。"),
        ("災害時の連絡手段の確認", "災害時の家族間・地域内の連絡手段を事前に確認しておきましょう。災害用伝言ダイヤルなども活用可能です。"),
        ("防災ラジオの貸出開始", "町内会では防災ラジオの無料貸出を開始しました。お申込みは町内会館まで。"),
    ],
    "イベント": [
        # 元の5件（略）

        ("清掃活動のご協力のお願い", "来週末に町内一斉清掃を行います。道具は町内会館にて貸し出し可能です。ご協力をお願いいたします。"),
        ("餅つき大会開催", "年末恒例の餅つき大会を開催します。つきたてのお餅をぜひご賞味ください。"),
        ("文化祭の出展者募集", "町内文化祭に向けて出展者を募集中です。手芸・写真・絵画など歓迎します。"),
        ("防災クイズ大会の開催", "親子で楽しめる防災クイズ大会を開催します。参加賞あり。お気軽にどうぞ。"),
        ("クリスマス飾り付けイベント", "町内の掲示板と公園をクリスマス仕様に飾りつけます。飾り付けに参加してみませんか？"),
    ]
}

def generate_posts(column, count):
    posts = []
    templates = data_templates[column]
    for template in templates:
        title, text = template
        title_with_index = f"{title}"
        posts.append({
            "title": title_with_index,
            "text": text,
            "columns": column
        })
    return posts

all_posts = []
for col in ["防犯", "防災", "イベント"]:
    all_posts.extend(generate_posts(col, 20))

for post in all_posts:
    response = requests.post(url, json=post, headers=headers)
    if response.status_code in [200, 201]:
        print(f"[成功] {post['columns']} - {post['title']}")
    else:
        print(f"[失敗] {post['columns']} - {post['title']}: {response.status_code}")
        print(response.text)
