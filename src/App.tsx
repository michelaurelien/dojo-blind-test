import logo from './assets/logo.svg';
import './App.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import swal from 'sweetalert';

const apiToken =
  'BQDH8H4kkM-TVXvf06X0jMPsHtlye969_4Y6ZiC05bY0ygxUz3RmCCvVC4N_vp6na_3UIJdMRlIkKzGmPk_P2frjcbVBiUKThtVz-4qiPpRyNGoNuh3P-3H8Iyhl7xVSWLwMbKhs48YIFYnlk2L8QNTwJxb0i4IojGeS5uKuufk4vFWwGfupvPUIRpTaahe8hM6ZtXBCz0h7ZDlbqT7BM_Hc_4Zc-VPlFYKLyEELfoqTW8DpWSyw_y7mQk8_QZtU3Xa2FvBFUgby654kji21EwLrEBH3qM4A3g6kLliURYYqguHCHQY52R2VKFR4xC25cWBciHXAttHycqmXcrhps1b-O1KU7Gabh4FSmeytSyJlKesL0j7dyNjRkUtFEqim1xStTadU9j533vw_TyfSklY-sMvsXnQ9is188er-ah7_yJT4Ca7N8zEnHlBzV4VRLyeq-O7i2to2bFXUTgiPXEvVs73rQBcay0ncwHcm2Yle26B6D0El2pwu4kt74-RWlB6VZ344ooqzCArvqaOwKxtFXgIs9YLA-6CMpPfHQZnhFl0CqqrdrMhoWdoJmrScHfSzLRI_R0vnpuMKzIFjzfEOgUEkpGAiW5BlbUsXtobP-b-fj9CJYf_ELSvuflqs6F1E8HCEy7oaoAWU5LVJoeL_cBWbvp5_JiHXH-8tpL7luRZ5fTopPhwMEq3FcwvNNaOWa_Z2cFk59tNMEmhx_F-h_W529_WxD0GtHFK_vnjUYl44nQirZBU9XqpfuL58G60y-WWYy0tWOHMGO7lEU';

const fetchTracks = async () => {
  const response = await fetch('https://api.spotify.com/v1/me/tracks', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + apiToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Fetching tracks failed with status ${response.status}`);
  }
  const data = (await response.json()) as { items: any[] };

  return data.items;
};

const pickRandomTrack = (tracks: any[]) => {
  return tracks[Math.floor(Math.random() * tracks.length)]!;
};

const shuffleArray = (tracks: any[]) => {
  return tracks.sort(() => Math.random() - 0.5);
};

const AlbumCover = ({ track }: { track: any }) => {
  return (
    <img
      src={track.album.images?.[0]?.url ?? ''}
      style={{ width: 200, height: 200 }}
    />
  );
};

const TrackButton = ({
  track,
  onClick,
}: {
  track: any;
  onClick: () => void;
}) => {
  return (
    <div className="App-track-button">
      <AlbumCover track={track.track} />
      <button onClick={onClick}>{track.track?.name}</button>
    </div>
  );
};

const App = () => {
  const {
    data: tracks,
    isSuccess,
    isLoading,
  } = useQuery({ queryKey: ['tracks'], queryFn: fetchTracks });

  const [currentTrack, setCurrentTrack] = useState<any | undefined>(
    undefined,
  );
  const [trackChoices, setTrackChoices] = useState<any[]>([]);

  useEffect(() => {
    if (!tracks) {
      return;
    }

    const rightTrack = pickRandomTrack(tracks);
    setCurrentTrack(rightTrack);

    const wrongTracks = [pickRandomTrack(tracks), pickRandomTrack(tracks)];
    const choices = shuffleArray([rightTrack, ...wrongTracks]);
    setTrackChoices(choices);
  }, [tracks]);

  const checkAnswer = (track: any) => {
    if (track.track?.id == currentTrack?.track?.id) {
      swal('Bravo !', "C'est la bonne réponse", 'success');
    } else {
      swal('Dommage !', "Ce n'est pas la bonne réponse", 'error');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Bienvenue sur le blind test</h1>
      </header>
      <div className="App-images">
        {isLoading || !isSuccess ? (
          'Loading...'
        ) : (
          <div>
            <div>
              <audio
                src={currentTrack?.track?.preview_url ?? ''}
                controls
                autoPlay
              />
            </div>
          </div>
        )}
      </div>
      <div className="App-buttons">
        {trackChoices.map(track => (
          <TrackButton track={track} onClick={() => checkAnswer(track)} />
        ))}
      </div>
    </div>
  );
};

export default App;
