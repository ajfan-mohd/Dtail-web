import React, { useState } from 'react';
import { uploadToWpMedia } from './mediaApi';
import { uploadImage, deleteImageByUrl } from './lib/storage';
import { signOut } from './lib/auth';
import SettingsTab from './components/admin/SettingsTab';
import { deleteCategory, updateCategoryBrochure, createCategory, createProject, deleteProject, createClient, deleteClient, updateCategoryCover, updateCategoryOrder } from './lib/portfolioApi';
import {
  ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown,
  Image as ImageIcon, LayoutGrid, Upload, X,
  Settings, Folder, ChevronRight, Camera, Code, Copy, Check
} from 'lucide-react';

export interface Project {
  id: number;
  title: string;
  category: string;
  img: string;
  gallery?: string[];
}

export interface Client {
  id?: string | number;
  name: string;
  logo: string;
}

interface DashboardProps {
  categories: string[];
  categoryMap: Record<string, string>;
  projects: Project[];
  clients: Client[];
  categoryCovers: Record<string, string>;
  setCategories: (c: string[]) => void;
  setProjects: (p: Project[]) => void;
  setClients: (cl: Client[]) => void;
  setCategoryCovers: (cv: Record<string, string>) => void;
  onBack: () => void;
  onReset: () => void;
}

export const Dashboard = ({
  categories, projects, clients, categoryCovers, categoryMap,
  setCategories, setProjects, setClients, setCategoryCovers,
  onBack, onReset
}: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'works' | 'categories' | 'clients' | 'settings'>('works');
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [catName, setCatName] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [workImg, setWorkImg] = useState('');
  const [workImages, setWorkImages] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientLogo, setClientLogo] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };
  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    bucket: 'portfolio-images' | 'client-logos' | 'brochures'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadImage(file, bucket);
      setter(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      showStatus('Upload failed', 'error');
    }
  };

  const handleMultipleFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    try {
      showStatus('Uploading images...', 'info');

      const uploadedUrls = await Promise.all(
        files.map((file) => uploadImage(file, 'portfolio-images'))
      );

      setWorkImages(uploadedUrls);
      setWorkImg(uploadedUrls[0] || '');

      showStatus(`${uploadedUrls.length} images uploaded`, 'success');
    } catch (error) {
      console.error('Multiple upload failed:', error);
      showStatus('Multiple upload failed', 'error');
    }
  };
  const showStatus = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setStatusMessage(message);
    setStatusType(type);

    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };
  const addCategory = async () => {
    if (!catName) return;

    const name = catName.toUpperCase().trim();

    if (!name || categories.includes(name)) return;

    try {
      const { data, error } = await createCategory(name);

      if (error) {
        console.error('Failed to create category:', error);
        return;
      }

      if (data) {
        setCategories([...categories, data.name]);
        setCatName('');
        showStatus('Category created successfully', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addWork = async () => {
    if ((!workImg && workImages.length === 0) || !selectedWorkCategory) {
      showStatus('Please upload image first', 'error');
      return;
    }

    try {
      const categoryId = Object.entries(categoryMap).find(
        ([name]) => name.trim().toLowerCase() === selectedWorkCategory.trim().toLowerCase()
      )?.[1];

      if (!categoryId) {
        showStatus('Category ID not found', 'error');
        return;
      }

      const imagesToSave = workImages.length > 0 ? workImages : [workImg];

      const createdProjects: Project[] = [];

      for (const imageUrl of imagesToSave) {
        const { data, error } = await createProject({
          categoryId,
          title: workTitle || '',
          imageUrl,
        });

        if (error) {
          console.error('Failed to create project:', error);
          showStatus('Failed to save some images', 'error');
          continue;
        }

        if (data) {
          createdProjects.push({
            id: data.id,
            title: data.title || '',
            category: selectedWorkCategory,
            img: data.image_url,
            gallery: [],
          });
        }
      }

      setProjects([...createdProjects, ...(projects || [])]);

      setWorkTitle('');
      setWorkImg('');
      setWorkImages([]);

      showStatus(`${createdProjects.length} project images added`, 'success');
    } catch (err) {
      console.error(err);
      showStatus('Failed to add project images', 'error');
    }
  };
  const updateCategoryThumbnail = async (newUrl: string) => {
    if (!selectedWorkCategory) return;

    const categoryId = categoryMap[selectedWorkCategory];

    if (!categoryId) {
      alert('Category ID not found');
      return;
    }

    const { error } = await updateCategoryCover(categoryId, newUrl);

    if (error) {
      console.error('Failed to update category cover:', error);
      showStatus('Failed to update category cover', 'error');
      return;
    }

    setCategoryCovers({
      ...categoryCovers,
      [selectedWorkCategory]: newUrl,
    });
  };
  const updateCategoryBrochureFile = async (newUrl: string) => {
    if (!selectedWorkCategory) return;

    const categoryId = categoryMap[selectedWorkCategory];

    if (!categoryId) {
      showStatus('Category ID not found', 'error');
      return;
    }

    const { error } = await updateCategoryBrochure(
      categoryId,
      newUrl
    );

    if (error) {
      console.error(error);
      showStatus('Failed to upload brochure', 'error');
      return;
    }

    showStatus('Brochure uploaded successfully', 'success');
  };
  const addClient = async () => {
    if (!clientLogo) return;

    const { data, error } = await createClient({
      name: clientName || 'Client',
      logoUrl: clientLogo,
    });

    if (error) {
      console.error('Failed to create client:', error);
      showStatus('Failed to create client', 'error');
      return;
    }

    if (data) {
      setClients([
        ...(clients || []),
        {
          id: data.id,
          name: data.name,
          logo: data.logo_url,
        },
      ]);

      setClientName('');
      setClientLogo('');
      showStatus('Client added successfully', 'success');
    }
  };

  const moveItem = (list: any[], setList: (l: any[]) => void, index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < newList.length) {
      [newList[index], newList[target]] = [newList[target], newList[index]];
      setList(newList);
    }
  };
  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    const newList = [...categories];
    const target = direction === 'up' ? index - 1 : index + 1;

    if (target < 0 || target >= newList.length) return;

    [newList[index], newList[target]] = [newList[target], newList[index]];

    setCategories(newList);

    const payload = newList
      .map((name, idx) => ({
        id: categoryMap[name],
        sort_order: idx + 1,
      }))
      .filter((item) => item.id);

    await updateCategoryOrder(payload);
  };
  const generateDataCode = () => {
    return `export const logoUrl = "assets/DTAIL LOGO.png";
export const categories = ${JSON.stringify(categories, null, 2)};

export const categoryCoverImages: Record<string, string> = ${JSON.stringify(categoryCovers, null, 2)};

export const clients = ${JSON.stringify(clients, null, 2)};

export const allProjects = ${JSON.stringify(projects, null, 2)};`.trim();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateDataCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Defense: filter out any null/undefined projects that might have slipped into localStorage
  const safeProjects = (projects || []).filter(p => p && p.category);
  const projectsInCategory = safeProjects.filter(p => p.category === selectedWorkCategory);
  const currentCategoryThumb = selectedWorkCategory ? categoryCovers[selectedWorkCategory] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20 selection:bg-brand selection:text-black animate-fade-in">

      <nav className="p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-[100] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-widest">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase transition-all"
          >
            Logout
          </button>
        </div>
        {statusMessage && (
          <div
            className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${statusType === 'success'
                ? 'bg-green-500 text-white'
                : statusType === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-brand text-black'
              }`}
          >
            {statusMessage}
          </div>
        )}
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {(['works', 'categories', 'clients', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedWorkCategory(null);
              }}
              className={`px-4 py-2 text-[10px] md:text-xs font-bold uppercase rounded-md transition-all ${activeTab === tab ? 'bg-brand text-black' : 'text-gray-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {activeTab === 'works' && (
          <div className="space-y-8 animate-fade-in">
            {!selectedWorkCategory ? (
              <>
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Portfolio Folders</h2>
                  <p className="text-gray-500 text-sm">Open a category folder to manage its images and thumbnail.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat, idx) => {
                    const count = safeProjects.filter(p => p.category === cat).length;
                    const thumb = categoryCovers[cat];
                    // Using index as part of key to avoid unique key error if duplicate names exist
                    return (
                      <button
                        key={`${cat}-${idx}`}
                        onClick={() => setSelectedWorkCategory(cat)}
                        className="group relative bg-white/5 border border-white/10 p-0 rounded-2xl flex flex-col items-stretch overflow-hidden hover:border-brand hover:bg-brand/5 transition-all text-left h-full shadow-2xl shadow-black/50"
                      >
                        <div className="aspect-[4/3] w-full bg-neutral-900 relative">
                          {thumb ? (
                            <img src={thumb} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Folder className="text-brand/10" size={64} />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-brand text-black p-2 rounded-lg shadow-xl z-10">
                            <Folder size={20} />
                          </div>
                        </div>
                        <div className="p-6 bg-black/40 backdrop-blur-md mt-auto border-t border-white/5">
                          <h3 className="text-xl font-bold uppercase mb-1 tracking-tight">{cat}</h3>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-brand font-mono uppercase tracking-widest">{count} items</p>
                            <ChevronRight size={16} className="text-gray-600 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="border-2 border-dashed border-white/10 p-8 rounded-2xl flex flex-col items-center justify-center hover:border-brand/50 hover:bg-brand/5 transition-all group min-h-[250px]"
                  >
                    <Plus className="text-gray-600 group-hover:text-brand mb-4" size={40} />
                    <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-brand">New Folder</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-10 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-10">
                  <div className="space-y-2">
                    <button onClick={() => setSelectedWorkCategory(null)} className="flex items-center gap-2 text-brand font-bold uppercase text-xs hover:underline">
                      <ArrowLeft size={16} /> Back to Folders
                    </button>
                    <h2 className="text-5xl font-black uppercase tracking-tighter">{selectedWorkCategory}</h2>
                    <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Storage: {projectsInCategory.length} assets</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-black">
                      {currentCategoryThumb ? <img src={currentCategoryThumb} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} /></div>}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-brand">Folder Thumbnail</p>
                      <label className="text-[10px] font-bold uppercase bg-white/10 px-3 py-1.5 rounded cursor-pointer hover:bg-brand hover:text-black transition-all inline-block">
                        Set Cover
                        <label className="text-[10px] font-bold uppercase bg-white/10 px-3 py-1.5 rounded cursor-pointer hover:bg-brand hover:text-black transition-all inline-block">
                          Upload Brochure
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={e =>
                              handleFile(
                                e,
                                updateCategoryBrochureFile,
                                'brochures'
                              )
                            }
                          />
                        </label>

                        <input type="file" className="hidden" onChange={e => handleFile(e, updateCategoryThumbnail, 'portfolio-images')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-32 bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
                      <h3 className="text-lg font-black uppercase tracking-tighter">Add New Image</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-gray-500">Project Name (Optional)</label>
                          <input type="text" placeholder="Title..." value={workTitle} onChange={e => setWorkTitle(e.target.value)}
                            className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-brand text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-gray-500">Upload Asset</label>
                          <div className="flex flex-col gap-4">
                            {workImg && <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-brand bg-black"><img src={workImg} className="w-full h-full object-cover" /></div>}
                            {workImages.length > 1 && (
                              <p className="text-xs text-brand font-bold uppercase">
                                {workImages.length} images selected
                              </p>
                            )}
                            <div className="flex gap-2">
                              <input type="text" placeholder="URL..." value={workImg} onChange={e => setWorkImg(e.target.value)}
                                className="flex-1 bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-brand text-xs font-mono"
                              />
                              <label className="bg-brand text-black p-4 rounded-xl cursor-pointer hover:opacity-80 transition-all flex items-center justify-center">
                                <Upload size={20} /><input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleMultipleFiles}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button onClick={addWork} disabled={!workImg} className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest transition-all ${workImg ? 'bg-brand text-black shadow-xl shadow-brand/20' : 'bg-white/5 text-gray-600'}`}>
                        Add to Folder
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {projectsInCategory.map((p) => (
                        <div key={p.id} className="group relative aspect-square bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-brand transition-all shadow-xl">
                          <img src={p.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                            <p className="font-bold text-xs truncate mb-3 uppercase tracking-wider">{p.title || ''}</p>
                            <button onClick={async () => {
                              if (!confirm('Delete this project?')) return;

                              const { error } = await deleteProject(p.id);

                              if (error) {
                                console.error('Failed to delete project:', error);
                                showStatus('Failed to delete project', 'error');
                                return;
                              }

                              await deleteImageByUrl(p.img, 'portfolio-images');
                              setProjects(safeProjects.filter(x => x.id !== p.id));
                              showStatus('Project deleted successfully', 'success');
                            }} className="bg-red-500 text-white p-3 rounded-xl flex items-center justify-center hover:bg-red-600 transition-all">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {projectsInCategory.length === 0 && (
                        <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                          <Folder className="mx-auto text-gray-800 mb-4" size={48} /><p className="text-gray-600 font-mono uppercase tracking-widest text-xs">Folder is empty.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <h2 className="text-sm font-bold uppercase text-brand mb-4 tracking-widest flex items-center gap-2"><Plus size={16} /> New Category Folder</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. BRANDING, SIGNAGE..."
                  className="flex-1 bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-brand text-lg font-bold"
                />
                <button onClick={addCategory} className="bg-brand text-black px-12 font-black rounded-2xl hover:scale-[1.02] transition-all h-16 uppercase tracking-widest shadow-xl shadow-brand/10">Create</button>
              </div>
            </div>
            <div className="grid gap-4">
              {categories.map((cat, i) => (
                <div key={`${cat}-${i}`} className="flex justify-between items-center p-8 bg-white/5 border border-white/5 rounded-3xl group hover:border-brand/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-brand transition-colors"><Folder size={24} /></div>
                    <span className="font-bold text-2xl uppercase tracking-tighter">{cat}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveCategory(i, 'up')} className="p-3 bg-white/5 hover:text-brand transition-all rounded-xl"><ArrowUp size={20} /></button>
                    <button onClick={() => moveCategory(i, 'down')} className="p-3 bg-white/5 hover:text-brand transition-all rounded-xl"><ArrowDown size={20} /></button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${cat}" and ALL its contents?`)) return;

                        const categoryId = categoryMap[cat];

                        if (!categoryId) {
                          showStatus('Category ID not found', 'error');
                          return;
                        }

                        const { error } = await deleteCategory(categoryId);

                        if (error) {
                          console.error('Failed to delete category:', error);
                          showStatus('Failed to delete category', 'error');
                          return;
                        }

                        setCategories(categories.filter(c => c !== cat));
                        setProjects(safeProjects.filter(p => p.category !== cat));

                        showStatus('Category deleted successfully', 'success');
                      }}
                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-sm font-bold uppercase text-brand tracking-widest">Add Partner Logo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Client Name" value={clientName} onChange={e => setClientName(e.target.value)} className="bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-brand" />
                <div className="flex gap-4">
                  <input type="text" placeholder="Logo URL" value={clientLogo} onChange={e => setClientLogo(e.target.value)} className="flex-1 bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-brand text-xs font-mono" />
                  <label className="bg-brand text-black p-5 rounded-2xl cursor-pointer hover:opacity-80 transition-all flex items-center justify-center"><Upload size={24} /><input type="file" className="hidden" onChange={e => handleFile(e, setClientLogo, 'client-logos')} /></label>
                </div>
              </div>
              {clientLogo && <div className="p-8 bg-black rounded-2xl border border-white/5 inline-block"><img src={clientLogo} className="h-16 invert grayscale opacity-80" alt="" /></div>}
              <button onClick={addClient} className="w-full bg-brand text-black font-black py-5 rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand/10">Add Partner</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {(clients || []).map((c, i) => (
                <div key={i} className="relative aspect-video p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center group hover:border-brand transition-all shadow-md">
                  <img src={c.logo} className="max-h-full max-w-full invert grayscale opacity-30 group-hover:opacity-100 transition-opacity" alt={c.name} />
                  <button onClick={async () => {
                    if (!confirm('Delete this client?')) return;

                    if (c.id) {
                      const { error } = await deleteClient(c.id);

                      if (error) {
                        console.error('Failed to delete client:', error);
                        showStatus('Failed to delete client', 'error');
                        return;
                      }
                    }

                    await deleteImageByUrl(c.logo, 'client-logos');
                    setClients(clients.filter((_, idx) => idx !== i));
                    showStatus('Client deleted successfully', 'success');
                  }} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            totalCategories={categories.length}
            totalProjects={projects.length}
            totalClients={clients.length}
            onReset={onReset}
          />
        )}
      </main>
    </div>
  );
};