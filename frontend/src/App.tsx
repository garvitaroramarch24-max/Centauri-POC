import React, { useState, useEffect } from 'react';
import type { Task, AuthState } from './types';
import axios from 'axios';
import { LogIn, LogOut, Plus, Trash2, CheckCircle, Circle, Edit2, Save, X } from 'lucide-react';

const API_URL = 'http://localhost:3000/tasks';

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    if (auth.token) {
      fetchTasks();
    }
  }, [auth.token]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks from PostgreSQL:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setAuth({ token: 'mock-jwt-token', user: { username } });
    }
  };

  const handleLogout = () => {
    setAuth({ token: null, user: null });
    setTasks([]);
    setUsername('');
    setPassword('');
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await axios.post<Task>(API_URL, {
        title: newTitle,
        description: newDesc,
      });
      setTasks([response.data, ...tasks]);
      setNewTitle('');
      setNewDesc('');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    const taskToToggle = tasks.find(t => t.id === id);
    if (!taskToToggle) return;

    try {
      const response = await axios.patch<Task>(`${API_URL}/${id}`, {
        isCompleted: !taskToToggle.isCompleted,
      });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description ?? '');
  };

  const saveUpdate = async (id: string) => {
    try {
      const response = await axios.patch<Task>(`${API_URL}/${id}`, {
        title: editTitle,
        description: editDesc,
      });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
      setEditingId(null);
    } catch (error) {
      console.error('Error saving task updates:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (!auth.token) {
    return (
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <LogIn size={24} color="#4f46e5" />
          <h2 style={{ margin: 0 }}>Task Tracker POC Login</h2>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Username</label>
            <input type="text" title="Username input field" placeholder="Enter username..." value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '95%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</label>
            <input type="password" title="Password input field" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '95%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" style={{ background: '#4f46e5', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Task Dashboard</h1>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Welcome, {auth.user?.username}</span>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#334155' }}>Create New Task</h3>
        <form onSubmit={createTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input type="text" title="New task title input" placeholder="Task Title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required style={{ padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          <textarea title="New task description details" placeholder="Description Details (Optional)..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} style={{ padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }} />
          <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10b981', color: '#fff', padding: '0.625rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={18} /> Add Task
          </button>
        </form>
      </section>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>No tasks found in the database. Add one above!</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', borderLeft: task.isCompleted ? '4px solid #10b981' : '4px solid #6366f1', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', display: 'flex', gap: '1rem', alignItems: 'start' }}>
              
              <button onClick={() => toggleTask(task.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: '0.2rem', color: task.isCompleted ? '#10b981' : '#cbd5e1' }} title={task.isCompleted ? "Mark task incomplete" : "Mark task complete"}>
                {task.isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
              </button>

              <div style={{ flexGrow: 1 }}>
                {editingId === task.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" title="Edit active task title input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 600 }} />
                    <textarea title="Edit active task description input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'none' }} />
                  </div>
                ) : (
                  <>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? '#64748b' : '#1e293b' }}>
                      {task.title}
                    </h4>
                    {task.description && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#475569' }}>{task.description}</p>}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editingId === task.id ? (
                  <>
                    <button onClick={() => saveUpdate(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }} title="Save"><Save size={18} /></button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Cancel"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="Edit"><Edit2 size={18} /></button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={18} /></button>
                  </>
                )}
              </div>

            </div>
          ))
        )}
      </main>
    </div>
  );
}

// src/App.tsx
// import React, { useState } from 'react';
// import type {Task, AuthState}  from './types'
// import { LogIn, LogOut, Plus, Trash2, CheckCircle, Circle, Edit2, Save, X } from 'lucide-react';

// export default function App() {
//   // Auth State (Mocking basic auth flow for API parity later)
//   const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   // Tasks State
//   const [tasks, setTasks] = useState<Task[]>([
//     { id: '1', title: 'Setup NestJS Backend', description: 'Initialize repository with modules, controllers, and TypeORM', isCompleted: false, createdAt: new Date().toISOString() },
//     { id: '2', title: 'Configure Vite Frontend', description: 'Scaffold React + TS base structure', isCompleted: true, createdAt: new Date().toISOString() }
//   ]);

//   // Form Inputs
//   const [newTitle, setNewTitle] = useState('');
//   const [newDesc, setNewDesc] = useState('');
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editTitle, setEditTitle] = useState('');
//   const [editDesc, setEditDesc] = useState('');

//   // Handle Mock Login
//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (username.trim() && password.trim()) {
//       setAuth({ token: 'mock-jwt-token', user: { username } });
//     }
//   };

//   // Handle Mock Logout
//   const handleLogout = () => {
//     setAuth({ token: null, user: null });
//     setUsername('');
//     setPassword('');
//   };

//   // CRUD: Create Task
//   const createTask = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newTitle.trim()) return;

//     const newTask: Task = {
//       id: crypto.randomUUID(),
//       title: newTitle,
//       description: newDesc,
//       isCompleted: false,
//       createdAt: new Date().toISOString()
//     };

//     setTasks([newTask, ...tasks]);
//     setNewTitle('');
//     setNewDesc('');
//   };

//   // CRUD: Toggle Completion Update
//   const toggleTask = (id: string) => {
//     setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
//   };

//   // CRUD: Init Edit Mode
//   const startEdit = (task: Task) => {
//     setEditingId(task.id);
//     setEditTitle(task.title);
//     setEditDesc(task.description);
//   };

//   // CRUD: Save Inline Update
//   const saveUpdate = (id: string) => {
//     setTasks(tasks.map(t => t.id === id ? { ...t, title: editTitle, description: editDesc } : t));
//     setEditingId(null);
//   };

//   // CRUD: Delete Task
//   const deleteTask = (id: string) => {
//     setTasks(tasks.filter(t => t.id !== id));
//   };

//   // ------------------ CONDITIONAL RENDER: AUTH GUARD ------------------
//   if (!auth.token) {
//     return (
//       <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginTop: '4rem' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
//           <LogIn size={24} color="#4f46e5" />
//           <h2 style={{ margin: 0 }}>Task Tracker POC Login</h2>
//         </div>
//         <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//           <div>
//             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Username</label>
//             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '95%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
//           </div>
//           <div>
//             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</label>
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '95%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
//           </div>
//           <button type="submit" style={{ background: '#4f46e5', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
//             Sign In
//           </button>
//         </form>
//       </div>
//     );
//   }

//   // ------------------ CONDITIONAL RENDER: DASHBOARD ------------------
//   return (
//     <div>
//       {/* Top Header Row */}
//       <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '2rem', background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Task Dashboard</h1>
//           <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Welcome, {auth.user?.username}</span>
//         </div>
//         <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
//           <LogOut size={16} /> Logout
//         </button>
//       </header>

//       {/* Task Creation Form */}
//       <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)' }}>
//         <h3 style={{ margin: '0 0 1rem 0', color: '#334155' }}>Create New Task</h3>
//         <form onSubmit={createTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
//           <input type="text" placeholder="Task Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required style={{ padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
//           <textarea placeholder="Description (Optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} style={{ padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }} />
//           <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10b981', color: '#fff', padding: '0.625rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
//             <Plus size={18} /> Add Task
//           </button>
//         </form>
//       </section>

//       {/* Task List Feed */}
//       <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//         {tasks.length === 0 ? (
//           <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>No tasks tracked yet. Add one above!</p>
//         ) : (
//           tasks.map(task => (
//             <div key={task.id} style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', borderLeft: task.isCompleted ? '4px solid #10b981' : '4px solid #6366f1', boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', display: 'flex', gap: '1rem', alignItems: 'start' }}>
              
//               {/* Checkbox Trigger */}
//               <button onClick={() => toggleTask(task.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: '0.2rem', color: task.isCompleted ? '#10b981' : '#cbd5e1' }}>
//                 {task.isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
//               </button>

//               {/* Text Layout Block (Conditional Inline Edit) */}
//               <div style={{ flexGrow: 1 }}>
//                 {editingId === task.id ? (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//                     <input type="text"  value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 600 }} />
//                     <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'none' }} />
//                   </div>
//                 ) : (
//                   <>
//                     <h4 style={{ margin: 0, fontSize: '1.1rem', textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? '#64748b' : '#1e293b' }}>
//                       {task.title}
//                     </h4>
//                     {task.description && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#475569' }}>{task.description}</p>}
//                   </>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div style={{ display: 'flex', gap: '0.5rem' }}>
//                 {editingId === task.id ? (
//                   <>
//                     <button onClick={() => saveUpdate(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }} title="Save Changes"><Save size={18} /></button>
//                     <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Cancel"><X size={18} /></button>
//                   </>
//                 ) : (
//                   <>
//                     <button onClick={() => startEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} title="Edit"><Edit2 size={18} /></button>
//                     <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={18} /></button>
//                   </>
//                 )}
//               </div>

//             </div>
//           ))
//         )}
//       </main>
//     </div>
//   );
// }
