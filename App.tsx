import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, MOCK_PEOPLE, ResponsiblePerson } from './types';
import { NewIssueModal } from './NewIssueModal';
import { StatusBadge } from './StatusBadge';
import { analyzeIssue } from './geminiService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { translations, Language } from './translations';
import { AuthPage } from './AuthPage';
import { Plus, Search, Trash2, BrainCircuit, Calendar, User as UserIcon, Loader2, Sparkles, Globe, Database, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('ru');
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<boolean>(false);

  const t = translations[lang];

  // Check Auth Session
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      setDbError(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setIsLoading(false); // Stop loading if no session to show auth screen
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch issues from Supabase
  const fetchIssues = async () => {
    if (!isSupabaseConfigured() || !session) return;

    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map DB fields (snake_case) to Frontend types (camelCase)
      const mappedIssues: Issue[] = (data || []).map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description,
        status: item.status as IssueStatus,
        createdAt: item.created_at,
        updatedAt: item.created_at, // Simplified for now
        responsibleId: item.responsible_id,
        aiAnalysis: item.ai_analysis
      }));

      setIssues(mappedIssues);
      setDbError(false);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setDbError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscription & Fetch triggers
  useEffect(() => {
    if (session) {
      setIsLoading(true);
      fetchIssues();

      const channel = supabase
        .channel('issues_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
          fetchIssues(); // Refresh data on any change
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  const handleAddIssue = async (title: string, description: string, responsibleId: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase.from('issues').insert([
        {
          title,
          description,
          status: IssueStatus.NEW,
          responsible_id: responsibleId,
          created_at: new Date().toISOString(),
        }
      ]);

      if (error) throw error;
      // Data will be refreshed automatically via subscription
    } catch (error) {
      console.error("Error adding issue:", error);
      alert("Failed to add issue");
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    
    try {
      const { error } = await supabase.from('issues').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: IssueStatus) => {
    // Optimistic update
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));

    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating status:", error);
      fetchIssues(); // Revert on error
    }
  };

  const handleResponsibleChange = async (id: string, newResponsibleId: string) => {
    // Optimistic update
    setIssues(prev => prev.map(i => i.id === id ? { ...i, responsibleId: newResponsibleId } : i));

    try {
      const { error } = await supabase
        .from('issues')
        .update({ responsible_id: newResponsibleId })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating responsible:", error);
      fetchIssues();
    }
  };

  const handleAiAnalysis = async (issue: Issue) => {
    setLoadingAnalysis(issue.id);
    const advice = await analyzeIssue(issue.title, issue.description, lang);
    
    try {
      const { error } = await supabase
        .from('issues')
        .update({ ai_analysis: advice })
        .eq('id', issue.id);
        
      if (error) throw error;
      
      // Update local state immediately just in case
      setIssues(prev => prev.map(i => 
        i.id === issue.id ? { ...i, aiAnalysis: advice } : i
      ));
    } catch (error) {
      console.error("Error saving AI analysis:", error);
    } finally {
      setLoadingAnalysis(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getResponsiblePerson = (id: string): ResponsiblePerson | undefined => {
    return MOCK_PEOPLE.find(p => p.id === id);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ru' : 'en');
  };

  const filteredIssues = issues.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (dbError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] text-gray-600 p-4 text-center">
        <Database size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Database Connection Missing</h2>
        <p className="max-w-md mb-6">
          To enable cloud sync, please connect Supabase.
          <br/><br/>
          1. Create a project at <a href="https://supabase.com" target="_blank" className="text-blue-600 underline">supabase.com</a>
          <br/>
          2. Add <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> to your Vercel Environment Variables.
        </p>
        <div className="bg-white p-4 rounded-lg shadow-sm text-left text-xs font-mono border border-gray-200 w-full max-w-lg overflow-auto">
          {`-- Run this SQL in Supabase SQL Editor:
create table issues (
  id bigint generated by default as identity primary key,
  title text not null,
  description text,
  status text default 'New',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  responsible_id text,
  ai_analysis text
);
alter publication supabase_realtime add table issues;`}
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage lang={lang} setLang={setLang} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center">
               <span className="text-white font-bold text-sm">L</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">{t.appTitle}</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
            >
              <Globe size={14} />
              <span className="hidden sm:inline">{lang.toUpperCase()}</span>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t.newIssue}</span>
            </button>

             <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t.buttons.logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
             {isLoading ? <Loader2 size={14} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
             {filteredIssues.length} {t.activeRecords}
          </div>
        </div>

        {/* Issues Grid/Table */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">{t.tableHeaders.issue}</th>
                  <th className="px-6 py-4">{t.tableHeaders.status}</th>
                  <th className="px-6 py-4">{t.tableHeaders.date}</th>
                  <th className="px-6 py-4">{t.tableHeaders.responsible}</th>
                  <th className="px-6 py-4 text-right">{t.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                   <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin text-blue-500" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t.emptyState}
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => {
                    const responsible = getResponsiblePerson(issue.responsibleId);
                    return (
                      <tr key={issue.id} className="hover:bg-gray-50/80 transition-colors duration-150 group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-md whitespace-normal">
                            <span className="text-sm font-semibold text-gray-900 mb-1">{issue.title}</span>
                            <span className="text-xs text-gray-500 leading-relaxed">{issue.description}</span>
                            
                            {/* AI Analysis Section */}
                            {issue.aiAnalysis && (
                              <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 flex items-start gap-2">
                                <BrainCircuit size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-purple-800 font-medium">{issue.aiAnalysis}</span>
                              </div>
                            )}
                            
                            {!issue.aiAnalysis && (
                               <button 
                               onClick={() => handleAiAnalysis(issue)}
                               disabled={loadingAnalysis === issue.id}
                               className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-fit"
                             >
                               {loadingAnalysis === issue.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                               {t.buttons.aiSuggest}
                             </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                          <StatusBadge status={issue.status} onChange={(s) => handleStatusChange(issue.id, s)} lang={lang} />
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={14} className="mr-1.5 text-gray-400" />
                            <span>{new Date(issue.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                          <div className="flex items-center group/person relative">
                            {responsible?.avatar ? (
                               <img src={responsible.avatar} alt={responsible.name} className="w-6 h-6 rounded-full mr-2 border border-gray-200" />
                            ) : (
                                <div className="w-6 h-6 rounded-full mr-2 bg-gray-200 flex items-center justify-center"><UserIcon size={14}/></div>
                            )}
                            <select 
                              value={issue.responsibleId}
                              onChange={(e) => handleResponsibleChange(issue.id, e.target.value)}
                              className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer hover:text-blue-600 transition-colors appearance-none pr-4"
                            >
                              {MOCK_PEOPLE.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top pt-5 text-right">
                          <button 
                            onClick={() => handleDeleteIssue(issue.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title={t.buttons.delete}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <NewIssueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddIssue}
        lang={lang}
      />
    </div>
  );
};

export default App;