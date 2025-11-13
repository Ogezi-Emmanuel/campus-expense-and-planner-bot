import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

const Account = ({ session }) => {
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState(null)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

  useEffect(() => {
    let ignore = false
    async function getProfile() {
      try {
        setLoading(true);
        if (!session || !session.user) {
          setLoading(false);
          return;
        }
        const { user } = session;

        let { data, error, status } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url, full_name`)
          .eq('id', user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setUsername(data.username);
          setWebsite(data.website);
          setAvatarUrl(data.avatar_url);
          setFullName(data.full_name);
        }
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    getProfile()

    return () => {
      ignore = true
    }
  }, [session])

  async function updateProfile(event, avatar_url) {
    event.preventDefault()

    setLoading(true)
    const { user } = session

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="expense-tracker-container">
      <div className="allowance-section">
        <form onSubmit={updateProfile} className="form-widget">
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="text" value={session.user.email} disabled />
          </div>
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName || ''}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username || ''}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="url"
              value={website || ''}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <button className="button block primary" type="submit" disabled={loading}>
              {loading ? 'Loading ...' : 'Update profile'}
            </button>
          </div>

          <div>
            <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Account