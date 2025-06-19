<<<<<<< Updated upstream
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> Stashed changes
import type { CSSProperties } from 'react';

const SendMessagePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('送信先（町会名）');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newsList, setNewsList] = useState<any[]>([]);
<<<<<<< Updated upstream
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);  // 追加：ユーザーID一覧用state

  const regionId = "ugyGiVvlg4fDN2afMnoe(RegionID)"; // ← RegionID
  const userId = "LI9dnLrsMP4gjjumF0me";  // ← 固定テスト用ユーザーID
=======
  const [nearRegionNewsList, setNearRegionNewsList] = useState<any[]>([]);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);

  const regionId = "ugyGiVvlg4fDN2afMnoe(RegionID)";
  const userId = "LI9dnLrsMP4gjjumF0me";

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/regions/names", {
        method: "GET",
      });

      if (!res.ok) {
        const error = await res.text();
        alert("地域の取得に失敗しました: " + error);
        return;
      }

      const data = await res.json();
      setRegions(data);
    } catch (err) {
      alert("通信エラーが発生しました");
      console.error(err);
    }
  };
>>>>>>> Stashed changes

  const handleSend = async () => {
    const payload = {
      title: title,
      text: body,
    };

    try {
      const res = await fetch(`http://localhost:8080/api/v1/users/post/messages?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("送信エラー:", error);
        alert("メッセージの送信に失敗しました");
        return;
      }

      const data = await res.json();
      alert(`メッセージ送信成功！メッセージID: ${data.id}`);

<<<<<<< Updated upstream
      // 入力リセット
=======
>>>>>>> Stashed changes
      setTitle('');
      setBody('');
    } catch (err) {
      console.error("通信エラー:", err);
      alert("通信に失敗しました");
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/regions/${regionId}/news`, {
        method: "GET",
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Fetch Error:", error);
        alert("ニュースの取得に失敗しました");
        return;
      }

      const data = await res.json();
      setNewsList(data);
    } catch (err) {
      console.error("通信エラー:", err);
      alert("通信に失敗しました");
    }
  };

<<<<<<< Updated upstream
=======
  const fetchNearRegionNews = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/regions/${regionId}/news/near_regions`, {
        method: "GET",
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("隣接ニュース取得エラー:", error);
        alert("隣接地域のニュース取得に失敗しました");
        return;
      }

      const data = await res.json();
      setNearRegionNewsList(data);
    } catch (err) {
      console.error("通信エラー:", err);
      alert("通信に失敗しました");
    }
  };

>>>>>>> Stashed changes
  const handleGetMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/users/messages?user_id=${userId}`, {
        method: "GET",
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("取得エラー:", error);
        alert("メッセージの取得に失敗しました");
        return;
      }

      const data = await res.json();
      setUserMessages(data);
    } catch (err) {
      console.error("通信エラー:", err);
      alert("通信に失敗しました");
    }
  };

<<<<<<< Updated upstream
  // 新規追加: FirestoreのUsersドキュメントID一覧取得
=======
>>>>>>> Stashed changes
  const fetchUserIds = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/users/get/id", {
        method: "GET",
      });

      if (!res.ok) {
        const error = await res.text();
        alert("ユーザーID一覧取得に失敗しました: " + error);
        return;
      }

      const data = await res.json();
      setUserIds(data.user_ids || []);
    } catch (err) {
      alert("通信エラーが発生しました");
      console.error(err);
    }
  };

  const styles: { [key: string]: CSSProperties } = {
    app: { display: 'flex' },
    sidebar: { width: '200px', backgroundColor: '#222', padding: '20px', color: '#fff' },
    sidebarButton: { display: 'block', marginBottom: '10px', backgroundColor: '#444', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' },
    main: { flexGrow: 1, padding: '20px' },
    title: { fontSize: '24px', marginBottom: '20px' },
    formContainer: { maxWidth: '600px' },
    dropdown: { marginBottom: '10px', cursor: 'pointer' },
    dropdownList: { listStyle: 'none', padding: 0, margin: 0, backgroundColor: '#eee' },
    dropdownItem: { padding: '8px', borderBottom: '1px solid #ccc', cursor: 'pointer' },
    inputBox: { marginBottom: '10px' },
    input: { width: '100%', padding: '8px' },
    textarea: { width: '100%', padding: '8px' },
    sendButton: { backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    userIdList: { marginTop: '20px' },
  };

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <button style={styles.sidebarButton}>町会をつくる</button>
        <button style={styles.sidebarButton}>メッセージ送信</button>
      </div>

      <div style={styles.main}>
        <h2 style={styles.title}>メッセージを一斉送信するページ</h2>

        <div style={styles.formContainer}>
          <div style={styles.dropdown} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span>{recipient} ▼</span>
          </div>

          {isDropdownOpen && (
            <ul style={styles.dropdownList}>
<<<<<<< Updated upstream
              {['町会A', '町会B', '町会C'].map((name) => (
                <li
                  key={name}
                  style={styles.dropdownItem}
                  onClick={() => {
                    setRecipient(name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {name}
=======
              {regions.map((region) => (
                <li
                  key={region.id}
                  style={styles.dropdownItem}
                  onClick={() => {
                    setRecipient(region.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {region.name}
>>>>>>> Stashed changes
                </li>
              ))}
            </ul>
          )}

          <div style={styles.inputBox}>
            <input
              type="text"
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputBox}>
            <textarea
              placeholder="本文"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <button style={styles.sendButton} onClick={handleSend}>
            メッセージ送信
          </button>

          <hr />

          <button onClick={fetchNews} style={styles.sendButton}>
            ニュース一覧を取得
          </button>

          <ul>
            {newsList.map((news) => (
              <li key={news.id}>
                <strong>{news.title}</strong> - {news.text}
              </li>
            ))}
          </ul>

          <hr />

<<<<<<< Updated upstream
=======
          <button onClick={fetchNearRegionNews} style={styles.sendButton}>
            隣接地域のニュースを取得
          </button>

          <ul>
            {nearRegionNewsList.length === 0 && <li>ニュースはありません</li>}
            {nearRegionNewsList.map((news) => (
              <li key={news.id}>
                <strong>{news.title}</strong> - {news.text}
              </li>
            ))}
          </ul>

          <hr />

>>>>>>> Stashed changes
          <button onClick={handleGetMessages} style={styles.sendButton}>
            ユーザーメッセージ取得
          </button>

          <ul>
            {userMessages.map((msg) => (
              <li key={msg.id}>
                <strong>{msg.Title}</strong> - {msg.Text} （{new Date(msg.Senttime).toLocaleString()}）
              </li>
            ))}
          </ul>

          <hr />

<<<<<<< Updated upstream
          {/* 新規追加部分 */}
=======
>>>>>>> Stashed changes
          <button onClick={fetchUserIds} style={styles.sendButton}>
            ユーザーID一覧を取得
          </button>

          <ul style={styles.userIdList}>
            {userIds.length === 0 && <li>ユーザーIDがありません</li>}
            {userIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SendMessagePage;
