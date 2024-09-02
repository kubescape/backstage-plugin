import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from '@material-ui/core';
import React, { useState } from 'react';
import { addCluster } from '../../api/KubescapeClient';

export function AddClusterForm({ formOpen, handleClose }) {
  const [clusterName, setClusterName] = useState('');
  const [config, setConfig] = useState('');
  const [error, setError] = useState('');
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClusterName(event.target.value);
  };
  const handleConfigChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(event.target.value);
  };

  return (
    <Dialog open={formOpen} onClose={handleClose}>
      <DialogTitle>Add New Cluster Information</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add the cluster you wish to scan by entering its name and
          kubeconfig file. Kubescape REQUIRES admin access to function
        </DialogContentText>

        {error !== '' && (
          <TextField
            error
            required
            label="Cluster Name"
            fullWidth
            value={clusterName}
            onChange={handleNameChange}
            helperText={error}
          />
        )}

        <TextField
          required
          label="Cluster Name"
          fullWidth
          value={clusterName}
          onChange={handleNameChange}
        />
        <TextField
          required
          label="Kubeconfig Content"
          multiline
          fullWidth
          value={config}
          onChange={handleConfigChange}
        />
        <DialogActions>
          <Button
            onClick={() => {
              addCluster(clusterName, config).then(status => {
                if (status === 'success') {
                  handleClose();
                } else {
                  setError(status);
                }
              });
            }}
          >
            Submit
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
