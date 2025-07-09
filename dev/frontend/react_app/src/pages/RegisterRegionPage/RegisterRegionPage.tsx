import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = `${import.meta.env.VITE_DEPLOY_URL}`;

async function callAPI(endpoint: string, method = 'GET', data = null) {
  const options: any = {
    method,
    headers: { 'Content-Type': 'application/json',
               'Authorization' : `Bearer ${import.meta.env.VITE_BACKEND_API_KEY}`
     },
  };
  if (data && method !== 'GET') options.body = JSON.stringify(data);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return response.json();
}

const RegisterRegionPage = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [nearRegions, setNearRegions] = useState([]);
  const [newRegionIdInput, setNewRegionIdInput] = useState('');
  const [newNearRegionIdInput, setNewNearRegionIdInput] = useState('');
  const [newRegionNameInput, setNewRegionNameInput] = useState(''); // ⭐️追加
  const [regionNameAndId, setRegionNameAndId] = useState({});

  const loadRegionOptions = useCallback(async () => {
    const fetched = await callAPI('/api/v1/regions/names');
    setRegions(fetched.map(region => `${region.name} (ID: ${region.id})`));
    setRegionNameAndId(fetched.reduce((acc, region) => {
      acc[region.id] = region.name;
      return acc;
    }, {}));
  }, []);

  const loadNearRegions = useCallback(async (regionId) => {
    const data = await callAPI(`/api/v1/near_regions/view?region_id=${regionId}`);
    setNearRegions(data || []);
  }, []);

  useEffect(() => { loadRegionOptions(); }, [loadRegionOptions]);
  useEffect(() => { if (selectedRegionId) loadNearRegions(selectedRegionId); }, [selectedRegionId, loadNearRegions]);

  const handleAddNearRegion = async () => {
    await callAPI(`/api/v1/near_regions/add?region_id=${selectedRegionId}`, 'POST', { ID: newNearRegionIdInput, Name: regionNameAndId[newNearRegionIdInput] || '' });
    setNewNearRegionIdInput('');
    loadNearRegions(selectedRegionId);
  };

  const handleDeleteNearRegion = async (docId) => {
    await callAPI(`/api/v1/near_regions/delete?region_id=${selectedRegionId}&doc_id=${docId}`, 'DELETE');
    loadNearRegions(selectedRegionId);
  };

  const handleRegisterRegion = async () => {
    if (!newRegionIdInput || !newRegionNameInput) {
      alert("地域IDと地域名を入力してください");
      return;
    }

    await callAPI(`/api/v1/regist/region?region_id=${newRegionIdInput}&region_name=${newRegionNameInput}`, 'POST');
    alert("地域を登録しました");
    setNewRegionIdInput('');
    setNewRegionNameInput('');
    loadRegionOptions();
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: 'white',
      minHeight: '100vh',
      color: '#333'
    },
    card: {
      
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(10px)',
      // border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '2rem',
      textAlign: 'center'
    },
    inputGroup: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    input: {
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      minWidth: '200px',
      flex: '1'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)'
    },
    button: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #718096 0%, #4a5568 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(113, 128, 150, 0.4)'
    },
    deleteButton: {
      background: 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)',
      color: 'white',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      boxShadow: '0 4px 15px rgba(252, 129, 129, 0.4)'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)'
    },
    section: {
      marginBottom: '2.5rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '1.5rem',
      position: 'relative',
      paddingLeft: '1rem'
    },
    sectionTitleBefore: {
      content: '""',
      position: 'absolute',
      left: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '2px'
    },
    regionList: {
      background: 'rgba(247, 250, 252, 0.8)',
      borderRadius: '12px',
      padding: '1.5rem',
      maxHeight: '300px',
      overflowY: 'auto',
      border: '1px solid rgba(226, 232, 240, 0.6)'
    },
    regionItem: {
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      background: 'white',
      border: '1px solid rgba(226, 232, 240, 0.4)',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    regionItemHover: {
      transform: 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      borderColor: '#667eea'
    },
    nearRegionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      marginBottom: '0.75rem',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid rgba(226, 232, 240, 0.6)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    },
    nearRegionItemHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    nearRegionText: {
      fontSize: '1.1rem',
      fontWeight: '500',
      color: '#2d3748'
    },
    addSection: {
      background: 'rgba(237, 242, 247, 0.5)',
      borderRadius: '16px',
      padding: '2rem',
      border: '2px dashed rgba(102, 126, 234, 0.3)',
      transition: 'all 0.3s ease'
    },
    addSectionHover: {
      borderColor: '#667eea',
      background: 'rgba(237, 242, 247, 0.8)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.section}>
          <h2 style={{...styles.sectionTitle, '::before': styles.sectionTitleBefore}}>
            <span style={{borderLeft: '4px solid #667eea', paddingLeft: '1rem'}}>地域一覧</span>
          </h2>
          <div style={styles.regionList}>
            {regions.map(region => (
              <div 
                key={region} 
                style={styles.regionItem}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.regionItemHover)}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.target.style.borderColor = 'rgba(226, 232, 240, 0.4)';
                }}
              >
                {region}
              </div>
            ))}
          </div>
        </div>
        <h1 style={styles.title}>町会（地域）登録ページ</h1>
        {/* ⭐️地域登録フォーム追加 */}
        <div style={{...styles.addSection, marginBottom: '2.5rem'}}>
          <h2 style={{...styles.sectionTitle, '::before': styles.sectionTitleBefore}}>
            <span style={{borderLeft: '4px solid #667eea', paddingLeft: '1rem'}}>新規地域登録</span>
          </h2>
          <div style={styles.inputGroup}>
            <input
              key="newRegionNameInput"
              type="text"
              placeholder="地域名"
              value={newRegionNameInput}
              onChange={(e) => setNewRegionNameInput(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            />
            <input
              key="newRegionIdInput"
              type="text"
              placeholder="地域ID"
              value={newRegionIdInput}
              onChange={(e) => setNewRegionIdInput(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            />
            
            <button
              onClick={handleRegisterRegion}
              style={{...styles.button, ...styles.primaryButton}}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
              onMouseLeave={(e) => {
                e.target.style.transform = 'none';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              地域を登録
            </button>
          </div>
        </div>

        <div style={{...styles.addSection, marginBottom: '2.5rem'}}>
          <div style={styles.inputGroup}>
          <input
            key="selectRegionIdInput"
            type="text"
            placeholder="地域ID"
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            style={styles.input}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'none';
            }}
          />
        </div>
          <div style={styles.inputGroup}>
            <input
              key="addnearRegionIdInput"
              type="text"
              placeholder="追加する隣接地域ID"
              value={newNearRegionIdInput}
              onChange={(e) => setNewNearRegionIdInput(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            />
            <button 
              onClick={handleAddNearRegion} 
              style={{...styles.button, ...styles.primaryButton}}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
              onMouseLeave={(e) => {
                e.target.style.transform = 'none';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              隣接地域を追加
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={{...styles.sectionTitle, '::before': styles.sectionTitleBefore}}>
            <span style={{borderLeft: '4px solid #667eea', paddingLeft: '1rem'}}>隣接地域一覧</span>
          </h2>
          {nearRegions.map(item => (
            <div 
              key={item.id} 
              style={styles.nearRegionItem}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.nearRegionItemHover)}
              onMouseLeave={(e) => {
                e.target.style.transform = 'none';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={styles.nearRegionText}>{item.data.ID}</span>
              <button 
                onClick={() => handleDeleteNearRegion(item.id)} 
                style={{...styles.button, ...styles.deleteButton}}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(252, 129, 129, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 4px 15px rgba(252, 129, 129, 0.4)';
                }}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterRegionPage;