import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const SendMessagePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('送信先（町会名）');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedRegionUsers, setSelectedRegionUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/regions/names");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRegions(data);
    } catch (err) {
      alert("地域の取得に失敗しました");
      console.error(err);
    }
  };

  const fetchUsersInSelectedRegion = async (regionId: string) => {
    setSelectedRegionUsers([]);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/regions/${regionId}/users`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelectedRegionUsers(data.users);
    } catch (err) {
      alert("地域のユーザー取得に失敗しました");
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!title || !body) {
      alert("タイトルと本文を入力してください");
      return;
    }

    if (!selectedRegionUsers.length) {
      alert("この地域にはユーザーがいません");
      return;
    }

    const payload = { title, text: body };
    let success = 0, failure = 0;

    for (const user of selectedRegionUsers) {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/users/post/messages?user_id=${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) success++;
        else failure++;
      } catch (err) {
        console.error("送信失敗", err);
        failure++;
      }
    }

    alert("メッセージ送信に成功しました。");
    setTitle('');
    setBody('');
  };

  const styles: { [key: string]: CSSProperties } = {
    app: { display: 'flex' },
    sidebar: { width: '200px', backgroundColor: '#222', padding: '20px', color: '#fff' },
    sidebarButton: { display: 'block', marginBottom: '10px', backgroundColor: '#444', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' },
    main: { flexGrow: 1, padding: '20px' },
    title: { fontSize: '24px', marginBottom: '20px' },
    formContainer: { maxWidth: '600px', width: '100%' },
    dropdown: { marginBottom: '10px', cursor: 'pointer' },
    dropdownList: { listStyle: 'none', padding: 0, margin: 0, backgroundColor: '#eee' },
    dropdownItem: { padding: '8px', borderBottom: '1px solid #ccc', cursor: 'pointer' },
    inputBox: { marginBottom: '10px' },
    input: { width: '100%', padding: '8px' },
    textarea: { width: '100%', padding: '8px' },
    sendButton: { backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
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
              {regions.map((region) => (
                <li
                  key={region.id}
                  style={styles.dropdownItem}
                  onClick={() => {
                    setRecipient(region.name);
                    setSelectedRegionId(region.id);
                    setIsDropdownOpen(false);
                    fetchUsersInSelectedRegion(region.id);
                  }}
                >
                  {region.name}
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
        </div>
      </div>
    </div>
  );
};

export default SendMessagePage;
