import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const SendMessagePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('送信先（町会名）');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedRegionUsers, setSelectedRegionUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_DEPLOY_URL}/api/v1/regions/names`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BACKEND_API_KEY}`,
          }
        }
      );
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
      const res = await fetch(`${import.meta.env.VITE_DEPLOY_URL}/api/v1/regions/${regionId}/users`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BACKEND_API_KEY}`,
          }
        });
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

    const payload = { title, text: body, author: "開発者" };
    let success = 0, failure = 0;

    for (const user of selectedRegionUsers) {
      try {
        const res = await fetch(`${import.meta.env.VITE_DEPLOY_URL}/api/v1/users/post/messages?user_id=${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
                     'Authorization': `Bearer ${import.meta.env.VITE_BACKEND_API_KEY}`
           },
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
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '40px',
      paddingBottom: '40px',
    },
    formContainer: {
      width: '100%',
      maxWidth: '800px',
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '32px',
      color: '#2d3748',
      textAlign: 'center' as const,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    dropdown: {
      marginBottom: '24px',
      cursor: 'pointer',
      position: 'relative' as const,
      backgroundColor: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '16px',
      color: '#4a5568',
      transition: 'all 0.3s ease',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e2e8f0',
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 10,
      overflow: 'hidden',
    },
    dropdownItem: {
      padding: '16px 20px',
      borderBottom: '1px solid #f1f5f9',
      cursor: 'pointer',
      fontSize: '16px',
      color: '#4a5568',
      transition: 'all 0.2s ease',
      backgroundColor: 'white',
    },
    inputBox: {
      marginBottom: '24px',
      position: 'relative' as const,
    },
    input: {
      width: '100%',
      padding: '18px 20px',
      fontSize: '16px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      transition: 'all 0.3s ease',
      outline: 'none',
      color: '#2d3748',
      boxSizing: 'border-box' as const,
    },
    textarea: {
      width: '100%',
      padding: '18px 20px',
      fontSize: '16px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      transition: 'all 0.3s ease',
      outline: 'none',
      color: '#2d3748',
      resize: 'vertical' as const,
      minHeight: '120px',
      fontFamily: 'inherit',
      lineHeight: '1.6',
      boxSizing: 'border-box' as const,
    },
    sendButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '18px 40px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
      position: 'relative' as const,
      overflow: 'hidden',
      display: 'block',
      margin: '0 auto',
    },
    userCount: {
      marginTop: '16px',
      padding: '12px 16px',
      backgroundColor: '#e6fffa',
      border: '1px solid #81e6d9',
      borderRadius: '8px',
      color: '#234e52',
      fontSize: '14px',
      fontWeight: '500',
    },
  };

  const hoverStyles = `
    <style>
      .dropdown:hover {
        border-color: #667eea !important;
        background-color: white !important;
      }
      
      .dropdown-item:hover {
        background-color: #f8fafc !important;
        color: #667eea !important;
      }
      
      .dropdown-item:last-child {
        border-bottom: none !important;
      }
      
      .input:focus, .textarea:focus {
        border-color: #667eea !important;
        background-color: white !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
      }
      
      .send-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4) !important;
      }
      
      .send-button:active {
        transform: translateY(0);
      }
    </style>
  `;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: hoverStyles }} />
      <div style={styles.app}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>📨 メッセージ一斉送信</h2>
          <div style={{ position: 'relative' }}>
          <div 
            className="dropdown"
            style={{
              ...styles.dropdown,
              position: 'relative'
            }} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              🏘️ {recipient}
            </span>
            <span style={{ 
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              fontSize: '12px'
            }}>
              ▼
            </span>
          </div>

          {isDropdownOpen && (
            <ul style={styles.dropdownList}>
              {regions.map((region) => (
                <li
                  key={region.id}
                  className="dropdown-item"
                  style={styles.dropdownItem}
                  onClick={() => {
                    setRecipient(region.name);
                    setSelectedRegionId(region.id);
                    setIsDropdownOpen(false);
                    fetchUsersInSelectedRegion(region.id);
                  }}
                >
                  🏘️ {region.name}
                </li>
              ))}
            </ul>
          )}
          </div>

          {selectedRegionUsers.length > 0 && (
            <div style={styles.userCount}>
              👥 送信対象: {selectedRegionUsers.length}名のユーザー
            </div>
          )}

          <div style={styles.inputBox}>
            <input
              className="input"
              type="text"
              placeholder="📝 メッセージのタイトルを入力してください"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputBox}>
            <textarea
              className="textarea"
              placeholder="✏️ メッセージの本文を入力してください..."
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <button 
            className="send-button"
            style={styles.sendButton} 
            onClick={handleSend}
          >
            🚀 メッセージを送信
          </button>
        </div>
      </div>
    </>
  );
};

export default SendMessagePage;
