import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  LogIn,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Edit2,
  Save,
  X,
  Zap,
} from 'lucide-react';
import type { Task, AuthState } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/tasks';

// Sophisticated design tokens
const colors = {
  bg: '#fafaf9',
  surface: '#ffffff',
  text: '#1a1a1a',
  textMuted: '#666666',
  border: '#e5e5e5',
  accentBlue: '#0066ff',
  accentGreen: '#00a854',
  accentRed: '#d63031',
  accentOrange: '#ff7a45',
} as const;

const styles = {
  card: {
    background: colors.surface,
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease',
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    borderRadius: '8px',
    border: `1.5px solid ${colors.border}`,
    boxSizing: 'border-box',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: colors.text,
    transition: 'all 0.2s ease',
  },
  buttonPrimary: {
    background: colors.accentBlue,
    color: '#fff',
    padding: '0.875rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonSuccess: {
    background: colors.accentGreen,
    color: '#fff',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonDanger: {
    background: colors.accentRed,
    color: '#fff',
    border: 'none',
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
} as const;

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

  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await axios.get<Task[]>(API_URL);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  useEffect(() => {
    if (auth.token) {
      fetchTasks();
    }
  }, [auth.token, fetchTasks]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) return;

    setAuth({
      token: 'mock-jwt-token',
      user: { username: cleanUsername },
    });
  };

  const handleLogout = () => {
    setAuth({ token: null, user: null });
    setTasks([]);
    setUsername('');
    setPassword('');
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = newTitle.trim();
    if (!title) return;

    try {
      const { data } = await axios.post<Task>(API_URL, {
        title,
        description: newDesc.trim(),
      });

      setTasks((prev) => [data, ...prev]);
      setNewTitle('');
      setNewDesc('');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    const taskToToggle = tasks.find((task) => task.id === id);
    if (!taskToToggle) return;

    try {
      const { data } = await axios.patch<Task>(`${API_URL}/${id}`, {
        isCompleted: !taskToToggle.isCompleted,
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? data : task))
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  const saveUpdate = async (id: string) => {
    const title = editTitle.trim();
    if (!title) return;

    try {
      const { data } = await axios.patch<Task>(`${API_URL}/${id}`, {
        title,
        description: editDesc.trim(),
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? data : task))
      );
      cancelEdit();
    } catch (error) {
      console.error('Error saving task updates:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (!auth.token) {
    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.bg} 0%, #f5f5f5 100%)`,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            ...styles.card,
            maxWidth: '420px',
            width: '100%',
            padding: '2.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: colors.accentBlue,
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: colors.text,
                letterSpacing: '-0.5px',
              }}
            >
              Task Pro
            </h1>
          </div>

          <form
            onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: colors.text,
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={styles.input}
                onFocus={(e) =>
                  (e.target.style.borderColor = colors.accentBlue)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = colors.border)
                }
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: colors.text,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={styles.input}
                onFocus={(e) =>
                  (e.target.style.borderColor = colors.accentBlue)
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = colors.border)
                }
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.buttonPrimary,
                opacity: username.trim() && password.trim() ? 1 : 0.6,
                marginTop: '0.5rem',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'translateY(-2px)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'translateY(0)')
              }
            >
              Sign In
            </button>
          </form>

          <p
            style={{
              fontSize: '0.8rem',
              color: colors.textMuted,
              marginTop: '1.5rem',
              textAlign: 'center',
              margin: '1.5rem 0 0 0',
            }}
          >
            Try any username and password to get started
          </p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div
      style={{
        background: colors.bg,
        minHeight: '100vh',
        paddingTop: '1.5rem',
        paddingBottom: '3rem',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <header
          style={{
            ...styles.card,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 700,
                color: colors.text,
                letterSpacing: '-0.5px',
              }}
            >
              Tasks
            </h1>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: colors.textMuted,
              }}
            >
              Welcome back, <strong>{auth.user?.username}</strong>
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              ...styles.buttonDanger,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = '0.85')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = '1')
            }
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* Stats */}
        {tasks.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                ...styles.card,
                padding: '1.25rem',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: colors.textMuted }}>
                Total Tasks
              </p>
              <p
                style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: colors.accentBlue,
                }}
              >
                {tasks.length}
              </p>
            </div>
            <div
              style={{
                ...styles.card,
                padding: '1.25rem',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: colors.textMuted }}>
                Completed
              </p>
              <p
                style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: colors.accentGreen,
                }}
              >
                {completedCount}
              </p>
            </div>
          </div>
        )}

        {/* Create Task Section */}
        <section
          style={{
            ...styles.card,
            padding: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <h2
            style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: colors.text,
            }}
          >
            New Task
          </h2>

          <form
            onSubmit={createTask}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              style={styles.input}
              onFocus={(e) =>
                (e.target.style.borderColor = colors.accentBlue)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = colors.border)
              }
            />

            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Add details (optional)"
              rows={2}
              style={{
                ...styles.input,
                resize: 'none',
                minHeight: '80px',
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = colors.accentBlue)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = colors.border)
              }
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              style={{
                ...styles.buttonSuccess,
                opacity: newTitle.trim() ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) =>
                newTitle.trim() &&
                (e.currentTarget.style.transform = 'translateY(-2px)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'translateY(0)')
              }
            >
              <Plus size={18} />
              Add Task
            </button>
          </form>
        </section>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.length === 0 ? (
            <div
              style={{
                ...styles.card,
                padding: '3rem 2rem',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, color: colors.textMuted, fontSize: '1rem' }}>
                No tasks yet. Create one above to get started.
              </p>
            </div>
          ) : (
            tasks.map((task) => {
              const isEditing = editingId === task.id;
              const isHovered = hoveredTaskId === task.id;

              return (
                <div
                  key={task.id}
                  style={{
                    ...styles.card,
                    padding: '1.25rem',
                    borderLeft: `3px solid ${
                      task.isCompleted ? colors.accentGreen : colors.accentBlue
                    }`,
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    opacity: task.isCompleted ? 0.7 : 1,
                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredTaskId(task.id)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    title={
                      task.isCompleted
                        ? 'Mark incomplete'
                        : 'Mark complete'
                    }
                    style={{
                      ...styles.iconButton,
                      marginTop: '0.25rem',
                      color: task.isCompleted
                        ? colors.accentGreen
                        : colors.border,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!task.isCompleted) {
                        e.currentTarget.style.color = colors.accentGreen;
                        e.currentTarget.style.background = 'rgba(0, 168, 84, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = task.isCompleted
                        ? colors.accentGreen
                        : colors.border;
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    {task.isCompleted ? (
                      <CheckCircle size={22} strokeWidth={2} />
                    ) : (
                      <Circle size={22} strokeWidth={1.5} />
                    )}
                  </button>

                  <div style={{ flexGrow: 1 }}>
                    {isEditing ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                        }}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{
                            ...styles.input,
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                          autoFocus
                        />
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          rows={2}
                          style={{
                            ...styles.input,
                            resize: 'none',
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: colors.text,
                            textDecoration: task.isCompleted
                              ? 'line-through'
                              : 'none',
                            opacity: task.isCompleted ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p
                            style={{
                              margin: '0.5rem 0 0 0',
                              fontSize: '0.875rem',
                              color: colors.textMuted,
                              opacity: task.isCompleted ? 0.5 : 0.8,
                              lineHeight: '1.4',
                            }}
                          >
                            {task.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveUpdate(task.id)}
                          style={{
                            ...styles.iconButton,
                            color: colors.accentGreen,
                          }}
                          title="Save"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              'rgba(0, 168, 84, 0.1)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'none')
                          }
                        >
                          <Save size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            ...styles.iconButton,
                            color: colors.accentRed,
                          }}
                          title="Cancel"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              'rgba(214, 48, 49, 0.1)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'none')
                          }
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          style={{
                            ...styles.iconButton,
                            color: colors.textMuted,
                          }}
                          title="Edit"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.accentBlue;
                            e.currentTarget.style.background =
                              'rgba(0, 102, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textMuted;
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          style={{
                            ...styles.iconButton,
                            color: colors.textMuted,
                          }}
                          title="Delete"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.accentRed;
                            e.currentTarget.style.background =
                              'rgba(214, 48, 49, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textMuted;
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}