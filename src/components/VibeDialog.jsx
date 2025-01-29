import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Vibes } from '../models/MainModels';
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setVibeDialog } from "../actions/actions";
import { useState, useEffect } from "react";

function VibeDialog({ selectedVibes, theme, setSelections }) {
	const dispatch = useDispatch();
	const open = useSelector((state) => state.vibeDialogOpen);
	const [form, setForm] = useState([]);

	useEffect(() => {
		setForm(selectedVibes);
	}, [selectedVibes]);

	const closeDialog = () => {
		dispatch(setVibeDialog(false));
	};

	const confirm = () => {
		setSelections(form);
		closeDialog();
	}

	const toggleVibe = (name) => {
		if (form.includes(name)) {
			setForm(form.filter(x => x !== name));
		} else {
			setForm([name, ...form]);
		}
	};

	return (
		<Dialog open={open} onClose={closeDialog}>
			<DialogTitle>
				{"What's the vibe?"}
			</DialogTitle>
			<DialogContent>
				<Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
					{Vibes.options.map((vibe) => (
						<Box key={vibe.Name} style={{ display: 'flex', flexDirection: 'column' }}>
							<Tooltip title={vibe.Name}>
								<IconButton onClick={() => { toggleVibe(vibe.Name) }} sx={{
									backgroundColor: form.includes(vibe.Name) ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
									border: form.includes(vibe.Name) ? `2px solid ${theme.primary}` : 'none'
								}}>
									{vibe.Icon}
								</IconButton>
							</Tooltip>
						</Box>
					))}
				</Box>
				<Typography variant="caption" style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center' }}>The map will reload to apply changes</Typography>
			</DialogContent>
			<DialogActions style={{ paddingTop: '0' }}>
				<Button onClick={confirm} variant='outlined' size='small'>Let's go!</Button>
			</DialogActions>
		</Dialog>
	);
}

export default VibeDialog;