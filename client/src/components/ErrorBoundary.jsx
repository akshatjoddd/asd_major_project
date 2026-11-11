import { Component } from 'react';
import i18n from '../i18n';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('Unhandled UI error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="crash">
        <span className="crash__glyph" aria-hidden="true">
          !
        </span>
        <h1>{i18n.t('common.somethingWentWrong')}</h1>
        <p>{this.state.error.message}</p>
        <div className="crash__actions">
          <button type="button" className="btn btn--accent" onClick={() => this.setState({ error: null })}>
            {i18n.t('common.retry')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => window.location.assign('#/')}>
            {i18n.t('ui.notFound.home')}
          </button>
        </div>
      </div>
    );
  }
}
