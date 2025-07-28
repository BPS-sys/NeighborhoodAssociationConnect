import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Globe, Calendar, FileText, Hash } from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_DEPLOY_URL}`;

async function callAPI(endpoint: string, method = 'GET', data = null) {
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_BACKEND_API_KEY}`
    },
  };
  if (data && method !== 'GET') options.body = JSON.stringify(data);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return response.json();
}

const EditNewsPage = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [regionName, setRegionName] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [newsForm, setNewsForm] = useState({
    title: '', text: '', columns: '', custom_id: '', start_time: '', isEditing: false, editingNewsId: null
  });

  const loadRegionOptions = useCallback(async () => {
    try {
      const fetchedRegions = await callAPI('/api/v1/regions/names');
      // ここはオブジェクト配列のまま保持
      setRegions(fetchedRegions);
    } catch (error) {
      console.error("地域オプションの読み込みに失敗しました:", error);
    }
  }, []);

  const loadNewsList = useCallback(async (regionId) => {
    const data = await callAPI(`/api/v1/regions/${regionId}/news`);
    const sorted = (data || []).sort((a, b) => new Date(b.time) - new Date(a.time));
    setNewsList(sorted);
  }, []);

  useEffect(() => {
    loadRegionOptions();
  }, [loadRegionOptions]);

  useEffect(() => {
    if (selectedRegionId) {
      
      loadNewsList(selectedRegionId);
    }
  }, [selectedRegionId,  loadNewsList]);

  const handleSubmitNews = async (e) => {
    e.preventDefault();
    const newsData = { ...newsForm };

    // ローカルdatetime-local文字列 → UTC ISO変換
    if (newsData.start_time) {
      const [datePart, timePart] = newsData.start_time.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      const utcMs = Date.UTC(year, month - 1, day, hour, minute) - (9 * 60 * 60 * 1000);
      const utcDate = new Date(utcMs);
      newsData.start_time = utcDate.toISOString();
    }

    if (newsForm.isEditing) {
      await callAPI(`/api/v1/regions/${selectedRegionId}/news/${newsForm.editingNewsId}`, 'PUT', newsData);
    } else {
      await callAPI(`/api/v1/regions/${selectedRegionId}/news`, 'POST', newsData);
    }

    setNewsForm({ title: '', text: '', columns: '', custom_id: '', start_time: '', isEditing: false, editingNewsId: null });
    loadNewsList(selectedRegionId);
  };

  const handleDeleteNews = async (newsId) => {
    await callAPI(`/api/v1/regions/${selectedRegionId}/news/${newsId}`, 'DELETE');
    loadNewsList(selectedRegionId);
  };

  const toDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toISOString().slice(0,16);
  };

  const handleEditNews = (news) => {
    setNewsForm({
      title: news.title,
      text: news.text,
      columns: news.columns || '',
      custom_id: news.id || '',
      start_time: toDatetimeLocal(news.starttime) || '',
      isEditing: true,
      editingNewsId: news.id
    });
  };

  const handleCancelEdit = () => {
    setNewsForm({ title: '', text: '', columns: '', custom_id: '', start_time: '', isEditing: false, editingNewsId: null });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText color="#2563eb" /> ニュース編集
          </h1>
          <p style={{ color: '#4b5563' }}>地域のニュースを管理・編集できます</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          {/* 左カラム：地域一覧とID入力 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe color="#16a34a" size={20} /> 地域一覧
              </h2>
              {regions.length > 0 ? (
                <div style={{ maxHeight: '256px', overflowY: 'auto' }}>
                  {regions.map(region => (
                    <div
                      key={region.id}
                      onClick={() => setSelectedRegionId(region.id)}
                      style={{
                        background: selectedRegionId === region.id ? '#d1fae5' : '#f9fafb',
                        borderLeft: '4px solid',
                        borderLeftColor: selectedRegionId === region.id ? '#22c55e' : '#4ade80',
                        borderRadius: '0.5rem',
                        padding: '12px',
                        fontSize: '0.875rem',
                        color: '#374151',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {region.name} (ID: {region.id})
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                  <Globe size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>地域IDがありません</p>
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: '1rem', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>地域ID選択</label>
              <div style={{ position: 'relative' }}>
                <Hash size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="地域IDを入力してください"
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none' }}
                />
              </div>
              {regionName && selectedRegionId && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                  <p style={{ color: '#1e40af', fontWeight: '500' }}><strong>選択された地域:</strong> {regionName}</p>
                  <p style={{ color: '#2563eb', fontSize: '0.875rem' }}>ID: {selectedRegionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* 右カラム：ニュース編集フォームとニュースリスト */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {newsForm.isEditing ? <Edit3 color="#ea580c" size={20} /> : <Plus color="#2563eb" size={20} />}
                {newsForm.isEditing ? 'ニュースを編集' : '新しいニュースを追加'}
              </h2>

              <form onSubmit={handleSubmitNews} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="タイトル"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  required
                  style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}
                />

                <textarea
                  placeholder="本文"
                  value={newsForm.text}
                  onChange={(e) => setNewsForm({ ...newsForm, text: e.target.value })}
                  rows={6}
                  required
                  style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '0.75rem', resize: 'none' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder="カラム"
                    value={newsForm.columns}
                    onChange={(e) => setNewsForm({ ...newsForm, columns: e.target.value })}
                    style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}
                  />

                  <input
                    type="text"
                    placeholder="カスタムID"
                    value={newsForm.custom_id}
                    onChange={(e) => setNewsForm({ ...newsForm, custom_id: e.target.value })}
                    style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}
                  />
                </div>

                <input
                  type="datetime-local"
                  value={newsForm.start_time}
                  onChange={(e) => setNewsForm({ ...newsForm, start_time: e.target.value })}
                  style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}
                />

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={!selectedRegionId}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '0.75rem',
                      background: selectedRegionId ? '#2563eb' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      cursor: selectedRegionId ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {newsForm.isEditing ? '更新' : '追加'}
                  </button>

                  {newsForm.isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '0.75rem',
                        border: '1px solid #d1d5db',
                        color: '#111827',
                        background: 'white',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </form>
            </div>

            {selectedRegionId && (
              <div style={{ background: 'white', borderRadius: '1rem', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
                  ニュース一覧 ({newsList.length}件)
                </h2>
                {newsList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {newsList.map(news => (
                      <div
                        key={news.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>{news.title}</h3>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditNews(news)}
                              style={{ color: '#ea580c', cursor: 'pointer', border: 'none', background: 'none' }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteNews(news.id)}
                              style={{ color: '#dc2626', cursor: 'pointer', border: 'none', background: 'none' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p style={{ color: '#374151' }}>{news.text}</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {news.columns && <span style={{ background: '#000000', color: 'white', padding: '4px 8px', borderRadius: '0.5rem' }}>{news.columns}</span>}
                          {news.custom_id && <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '0.5rem' }}>ID: {news.custom_id}</span>}
                          {news.starttime && (
                            <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {new Date(news.starttime).toLocaleString('ja-JP')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center' }}>ニュースがありません</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNewsPage;


// Copyright (c) 2025 YukiTakayama, ShingoNakano, SaihaHatanaka
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。