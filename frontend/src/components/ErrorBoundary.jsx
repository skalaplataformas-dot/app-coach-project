'use client';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
            <span className="text-red-400 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Algo salio mal</h2>
          <p className="text-gray-400 mb-4 text-sm max-w-md">
            Ocurrio un error inesperado. Intenta recargar la pagina.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn-primary text-sm"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
