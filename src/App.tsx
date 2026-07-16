setLiveMatches(matches);
      setSyncStatus('success');
      setSyncMessage('Synced successfully.');
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('Sync failed. Please check your API Key.');
    }
  };

  useEffect(() => {
    // Initial fetch
    handleForceSync();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-black">INVRTFUNNEL<span className="text-emerald-400">FC</span></h1>
        <button 
          onClick={handleForceSync}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition border border-emerald-500/20"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      </header>

      <div className="grid gap-4">
        {liveMatches.map(match => (
          <div key={match.id} className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="font-bold">{match.homeTeam.name} vs {match.awayTeam.name}</h2>
              <p className="text-xs text-slate-400">{match.status.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
