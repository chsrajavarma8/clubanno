import { useState } from 'react'
import * as authService from '../services/auth'

export default function LoginModal({ onClose, onLogin, onSignup }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot' | 'reset'

  // Shared login fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Signup fields
  const [signupEmail, setSignupEmail] = useState('')
  const [signupDob, setSignupDob] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')

  // Forgot-password fields
  const [fpEmail, setFpEmail] = useState('')
  const [fpDob, setFpDob] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
    setInfo('')
  }

  async function handleLoginSubmit() {
    if (submitting) return
    if (!username.trim() || !password.trim()) {
      setError('Enter your email and password.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await onLogin({ username: username.trim(), password: password.trim() })
      if (result && result.error) setError(result.error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignupSubmit() {
    if (submitting) return
    if (!signupEmail.trim() || !signupDob || !signupPassword.trim()) {
      setError('Fill in email, date of birth, and password.')
      return
    }
    if (signupPassword.length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await onSignup({ email: signupEmail.trim(), dob: signupDob, password: signupPassword })
      if (result && result.error) setError(result.error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyDob() {
    if (submitting) return
    if (!fpEmail.trim() || !fpDob) {
      setError('Enter your email and date of birth.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await authService.verifyDob(fpEmail.trim(), fpDob)
      setMode('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetSubmit() {
    if (submitting) return
    if (!newPassword.trim()) {
      setError('Enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await authService.resetPassword(fpEmail.trim(), fpDob, newPassword)
      setInfo('Password updated. You can log in with your new password now.')
      setNewPassword('')
      setNewPasswordConfirm('')
      setMode('login')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mode === 'login' && 'Log In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Forgot Password'}
            {mode === 'reset' && 'Set New Password'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {info && mode === 'login' && <div className="approval-note">{info}</div>}

          {mode === 'login' && (
            <>
              <div className="field">
                <label>Email</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. codingclub@college.edu"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="auth-links">
                <button type="button" className="link-btn" onClick={() => switchMode('forgot')}>Forgot password?</button>
                <button type="button" className="link-btn" onClick={() => switchMode('signup')}>Create an account</button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. yourname@college.edu"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Date of Birth</label>
                <input type="date" value={signupDob} onChange={(e) => setSignupDob(e.target.value)} />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  onKeyDown={(e) => e.key === 'Enter' && handleSignupSubmit()}
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="auth-links">
                <button type="button" className="link-btn" onClick={() => switchMode('login')}>Already have an account? Log in</button>
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="approval-note">
                Enter the email and date of birth you signed up with. If they match, you'll be able to set a new password.
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  placeholder="e.g. yourname@college.edu"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Date of Birth</label>
                <input type="date" value={fpDob} onChange={(e) => setFpDob(e.target.value)} />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="auth-links">
                <button type="button" className="link-btn" onClick={() => switchMode('login')}>Back to log in</button>
              </div>
            </>
          )}

          {mode === 'reset' && (
            <>
              <div className="approval-note">Verified — set a new password for {fpEmail}.</div>
              <div className="field">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="Re-enter your new password"
                  onKeyDown={(e) => e.key === 'Enter' && handleResetSubmit()}
                />
              </div>
              {error && <div className="form-error">{error}</div>}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {mode === 'login' && (
            <button className="btn-primary" onClick={handleLoginSubmit} disabled={submitting}>
              {submitting ? 'Signing in…' : 'Log In'}
            </button>
          )}
          {mode === 'signup' && (
            <button className="btn-primary" onClick={handleSignupSubmit} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Account'}
            </button>
          )}
          {mode === 'forgot' && (
            <button className="btn-primary" onClick={handleVerifyDob} disabled={submitting}>
              {submitting ? 'Checking…' : 'Verify'}
            </button>
          )}
          {mode === 'reset' && (
            <button className="btn-primary" onClick={handleResetSubmit} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Password'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
