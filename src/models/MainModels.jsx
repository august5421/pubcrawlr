import LocalDiningIcon from '@mui/icons-material/LocalDining';
import NightlifeIcon from '@mui/icons-material/Nightlife';
import LooksIcon from '@mui/icons-material/Looks';
import WineBarIcon from '@mui/icons-material/WineBar';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import LiquorIcon from '@mui/icons-material/Liquor';

export class Vibes {
	static options = [
		{ Name: 'Serves Food', Icon: <LocalDiningIcon />, KeyWords: 'restaurant OR bar OR pub' },
		{ Name: 'Night Clubs', Icon: <NightlifeIcon />, KeyWords: 'night club OR dancing OR live music' },
		{ Name: 'LGBTQ+', Icon: <LooksIcon />, KeyWords: 'gay bar OR lgbtq friendly' },
		{ Name: 'Winery', Icon: <WineBarIcon />, KeyWords: 'winery OR meadery OR wine' },
		{ Name: 'Brewery', Icon: <SportsBarIcon />, KeyWords: 'brewery OR taproom OR beer' },
		{ Name: 'Distillery', Icon: <LiquorIcon />, KeyWords: 'distillery OR spirits' }
	];

	static defaultKeyword = 'bar OR pub OR drinks OR cocktails';

	static getKeyword(selections) {
		const arr = this.options.filter(x => selections.includes(x.Name));
		let text = '';
		for (let i = 0; i < arr.length; i++) {
			if (i === arr.length - 1) text += arr[i].KeyWords;
			else text = text + arr[i].KeyWords + " OR ";
		}
		return text;
	}
}