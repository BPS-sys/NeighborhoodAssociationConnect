import React, { useState, useEffect, useCallback } from 'react';

// バックエンドのベースURL
const API_BASE_URL = 'http://0.0.0.0:8080';

// API呼び出しの共通関数
// Reactコンポーネントの外部に定義することで、再レンダリング時の再生成を防ぎます。
async function callAPI(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  } else if (data && method === 'GET' && Object.keys(data).length > 0) {
    const params = new URLSearchParams(data).toString();
    endpoint = `${endpoint}?${params}`;
  }

  try {
    // API_BASE_URLをエンドポイントに付加
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      let errorDetail = '不明なエラー';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = response.statusText;
      }
      alert(`APIエラー (${response.status} ${response.statusText}): ${errorDetail}`);
      throw new Error(`HTTP error! status: ${response.status} - ${errorDetail}`);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    console.error('API呼び出し中にエラーが発生しました:', error);
    alert('通信エラーが発生しました。サーバーが起動しているか、ネットワーク接続を確認してください。');
    throw error;
  }
}

const RegisterRegionPage = () => {
  // 地域一覧を管理するステート
  const [regions, setRegions] = useState([]);
  // 選択されている地域を管理するステート
  const [selectedRegionId, setSelectedRegionId] = useState('');
  // 選択された地域の隣接地域を管理するステート
  const [nearRegions, setNearRegions] = useState([]);
  // 新しく追加する地域IDを管理するステート
  const [newRegionIdInput, setNewRegionIdInput] = useState('');
  // 選択された地域のニュース一覧を管理するステート
  const [newsList, setNewsList] = useState([]);
  // ニュース追加/編集フォームのステート
  const [newsForm, setNewsForm] = useState({
    title: '',
    text: '',
    columns: '',
    custom_id: '',
    isEditing: false, // 編集モードかどうかのフラグ
    editingNewsId: null, // 編集中のニュースID
  });

  // 地域選択オプションをロードする関数
  const loadRegionOptions = useCallback(async () => {
    try {
      const fetchedRegions = await callAPI('/regions/view');
      setRegions(fetchedRegions);
    } catch (error) {
      console.error("地域オプションの読み込みに失敗しました:", error);
    }
  }, []);

  // 隣接地域をロードする関数
  const loadNearRegions = useCallback(async (regionId) => {
    if (!regionId) {
      setNearRegions([]);
      return;
    }
    try {
      const data = await callAPI(`/near_regions/view?region_id=${regionId}`);
      setNearRegions(data || []); // データがない場合は空配列を設定
    } catch (error) {
      console.error("隣接地域の読み込みに失敗しました:", error);
    }
  }, []);

  // ニュース一覧をロードする関数
  const loadNewsList = useCallback(async (regionId) => {
    if (!regionId) {
      setNewsList([]);
      return;
    }
    try {
      const data = await callAPI(`/regions/${regionId}/news`);
      setNewsList(data || []);
    } catch (error) {
      console.error("ニュース一覧の読み込みに失敗しました:", error);
    }
  }, []);

  // コンポーネントマウント時に地域オプションをロード
  useEffect(() => {
    loadRegionOptions();
  }, [loadRegionOptions]);

  // 選択された地域IDが変更されたら隣接地域とニュースをロード
  useEffect(() => {
    loadNearRegions(selectedRegionId);
    loadNewsList(selectedRegionId); // ニュースもロード
  }, [selectedRegionId, loadNearRegions, loadNewsList]);

  // 地域選択時のハンドラ
  const handleRegionChange = (e) => {
    setSelectedRegionId(e.target.value);
    // 地域が変更されたらフォームをリセット
    setNewsForm({
      title: '',
      text: '',
      columns: '',
      custom_id: '',
      isEditing: false,
      editingNewsId: null,
    });
  };

  // 隣接地域追加ボタンのハンドラ
  const handleAddNearRegion = async () => {
    if (!selectedRegionId) {
      alert('地域を選択してください。');
      return;
    }
    if (!newRegionIdInput) {
      alert('追加する地域IDを入力してください。');
      return;
    }

    try {
      await callAPI(`/near_regions/add?region_id=${selectedRegionId}`, 'POST', { ID: newRegionIdInput });
      alert('隣接地域を追加しました。');
      setNewRegionIdInput(''); // 入力フィールドをクリア
      loadNearRegions(selectedRegionId); // 現在選択中の地域を再読み込み
    } catch (error) {
      console.error("隣接地域の追加に失敗しました:", error);
    }
  };

  // 隣接地域削除ボタンのハンドラ
  const handleDeleteNearRegion = async (docId) => {
    if (!confirm('本当にこの隣接地域を削除しますか？')) {
      return;
    }
    try {
      await callAPI(`/near_regions/delete?region_id=${selectedRegionId}&doc_id=${docId}`, 'DELETE');
      alert('隣接地域を削除しました。');
      loadNearRegions(selectedRegionId); // 現在選択中の地域を再読み込み
    } catch (error) {
      console.error("隣接地域の削除に失敗しました:", error);
    }
  };

  // ニュースフォーム入力ハンドラ
  const handleNewsFormChange = (e) => {
    const { name, value } = e.target;
    setNewsForm((prev) => ({ ...prev, [name]: value }));
  };

  // ニュース追加/編集の送信ハンドラ
  const handleSubmitNews = async (e) => {
    e.preventDefault();
    if (!selectedRegionId) {
      alert('地域を選択してください。');
      return;
    }
    if (!newsForm.title || !newsForm.text || !newsForm.columns) {
      alert('ニュースのタイトル、本文、列は必須です。');
      return;
    }

    const newsData = {
      title: newsForm.title,
      text: newsForm.text,
      columns: newsForm.columns,
    };

    try {
      if (newsForm.isEditing) {
        // 編集モード
        await callAPI(
          `/regions/${selectedRegionId}/news/${newsForm.editingNewsId}`,
          'PUT',
          newsData
        );
        alert('ニュースを編集しました。');
      } else {
        // 追加モード
        if (newsForm.custom_id) {
          newsData.custom_id = newsForm.custom_id;
        }
        await callAPI(`/regions/${selectedRegionId}/news`, 'POST', newsData);
        alert('ニュースを追加しました。');
      }

      // フォームをリセットしてニュースリストを再読み込み
      setNewsForm({
        title: '',
        text: '',
        columns: '',
        custom_id: '',
        isEditing: false,
        editingNewsId: null,
      });
      loadNewsList(selectedRegionId);
    } catch (error) {
      console.error("ニュースの操作に失敗しました:", error);
    }
  };

  // ニュース編集ボタンクリック時のハンドラ
  const handleEditNews = (newsItem) => {
    setNewsForm({
      title: newsItem.title,
      text: newsItem.text,
      columns: newsItem.columns,
      custom_id: newsItem.id, // 編集時はcustom_idも表示
      isEditing: true,
      editingNewsId: newsItem.id,
    });
    // フォームまでスクロールするなど、UXを改善する処理を追加しても良い
  };

  // ニュース削除ボタンクリック時のハンドラ
  const handleDeleteNews = async (newsId) => {
    if (!confirm('本当にこのニュースを削除しますか？')) {
      return;
    }
    try {
      await callAPI(`/regions/${selectedRegionId}/news/${newsId}`, 'DELETE');
      alert('ニュースを削除しました。');
      loadNewsList(selectedRegionId);
    } catch (error) {
      console.error("ニュースの削除に失敗しました:", error);
    }
  };

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">地域共生管理ダッシュボード</h1>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* 隣接地域管理セクション */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">隣接地域管理</h2>
          {/* ここに地域IDのリストを直接表示する例を追加 */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">地域IDの一覧:</h3>
            {regions.length > 0 ? (
              <ul className="list-disc list-inside">
                {regions.map((region) => (
                  <li key={region}>{region}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">地域IDがありません。</p>
            )}
          </div>
          <div className="mb-4">
            {/*<select
              className="border p-2 rounded w-64 mr-2"
              value={selectedRegionId}
              onChange={handleRegionChange}
            >
              <option value="">地域を選択してください</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>*/}
            <input
              type="text"
              placeholder="編集する地域のID"
              className="border p-2 rounded w-64 mr-2"
              value={selectedRegionId}
              onChange={handleRegionChange}
            />
            <button
              onClick={loadRegionOptions}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              更新
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="追加する隣接地域のID"
              className="border p-2 rounded w-64 mr-2"
              value={newRegionIdInput}
              onChange={(e) => setNewRegionIdInput(e.target.value)}
            />
            <button
              onClick={handleAddNearRegion}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              隣接地域を追加
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-2">選択中の地域の隣接地域: {selectedRegionId || 'なし'}</h3>
            {nearRegions.length > 0 ? (
              nearRegions.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span>{item.data.ID} (ID: {item.id})</span>
                  <button
                    onClick={() => handleDeleteNearRegion(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600">隣接地域はありません。</p>
            )}
          </div>
        </section>

        {/* ニュース管理セクション */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">ニュース管理 ({selectedRegionId || '地域未選択'})</h2>

          {selectedRegionId ? (
            <>
              {/* ニュース追加/編集フォーム */}
              <form onSubmit={handleSubmitNews} className="space-y-4 mb-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">タイトル</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newsForm.title}
                    onChange={handleNewsFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-700">本文</label>
                  <textarea
                    id="text"
                    name="text"
                    value={newsForm.text}
                    onChange={handleNewsFormChange}
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="columns" className="block text-sm font-medium text-gray-700">列</label>
                  <input
                    type="text"
                    id="columns"
                    name="columns"
                    value={newsForm.columns}
                    onChange={handleNewsFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                {!newsForm.isEditing && ( // 編集モードでなければカスタムIDフィールドを表示
                  <div>
                    <label htmlFor="custom_id" className="block text-sm font-medium text-gray-700">カスタムID (任意)</label>
                    <input
                      type="text"
                      id="custom_id"
                      name="custom_id"
                      value={newsForm.custom_id}
                      onChange={handleNewsFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="指定しない場合自動生成"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className={`${newsForm.isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded`}
                >
                  {newsForm.isEditing ? 'ニュースを更新' : 'ニュースを追加'}
                </button>
                {newsForm.isEditing && (
                  <button
                    type="button"
                    onClick={() => setNewsForm({ title: '', text: '', columns: '', custom_id: '', isEditing: false, editingNewsId: null })}
                    className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    キャンセル
                  </button>
                )}
              </form>

              {/* ニュース一覧 */}
              <h3 className="text-lg font-medium mb-2">ニュース一覧</h3>
              {newsList.length > 0 ? (
                <div className="space-y-4">
                  {newsList.map((newsItem) => (
                    <div key={newsItem.id} className="bg-gray-50 p-4 rounded shadow-sm">
                      <h4 className="font-semibold text-lg">{newsItem.title}</h4>
                      <p className="text-gray-700 text-sm mb-2">ID: {newsItem.id} | Columns: {newsItem.columns}</p>
                      <p className="text-gray-800">{newsItem.text}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        最終更新: {new Date(newsItem.time).toLocaleString('ja-JP')}
                      </p>
                      <div className="mt-3 space-x-2">
                        <button
                          onClick={() => handleEditNews(newsItem)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteNews(newsItem.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">この地域にはニュースがありません。</p>
              )}
            </>
          ) : (
            <p className="text-gray-600">地域を選択すると、ニュースの管理ができます。</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default RegisterRegionPage;