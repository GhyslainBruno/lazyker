import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import CancelCircle from "@material-ui/icons/CancelOutlined";
import GooglePicker from "react-google-picker";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Folder from "@material-ui/icons/FolderOpen";
import CheckCircle from "@material-ui/icons/CheckCircle";
import LinkOff from "@material-ui/icons/LinkOff";
import Link from "@material-ui/icons/Link";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import OutlinedInput from "@material-ui/core/OutlinedInput/OutlinedInput";
import MenuItem from "@material-ui/core/MenuItem";
import InputAdornment from "@material-ui/core/InputAdornment/InputAdornment";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Visibility from "@material-ui/icons/Visibility";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import React from "react";


const Storage = props => {
    return (
        <ExpansionPanelDetails>
            <Grid container spacing={0}>
                <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                    Storage
                </Grid>

                <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>

                    <Chip
                      label="Uptobox"
                      variant={props.storage === "uptobox" ? "default" : "outlined"}
                      style={{margin: '3px'}} clickable="true"
                      onClick={() => {props.setStorage('uptobox')}}/>
                    <Chip
                        label="Google Drive"
                        variant={props.storage === "gdrive" ? "default" : "outlined"}
                        style={{margin: '3px'}} clickable="true"
                        onClick={() => {props.setStorage('gdrive')}}/>
                    <Chip
                        label="NAS Synology"
                        variant={props.storage === "nas" ? "default" : "outlined"}
                        style={{margin: '3px'}}
                        // clickable="true"
                        // onClick={() => {props.setStorage('nas')}}
                    />
                </Grid>

                {props.storage === 'gdrive' ?
                    <div style={{width: '100%'}}>
                        { props.googleDriveConnectLoading ?
                            <CircularProgress style={props.settingsLoading ? {display: 'inline-block', margin: '5px'} : {display: 'none'}} />
                            :
                            <Grid item xs={12} style={{padding: '6px'}}>

                                <div style={{display: 'flex'}}>
                                    <div style={{flex: '1', marginTop: '10px'}}>
                                        Movies
                                    </div>
                                    <div style={{flex: '1', marginTop: '10px'}}>
                                        {
                                            props.moviesGdriveFolderName !== null ?
                                                <Chip
                                                    label={props.moviesGdriveFolderName}
                                                    onDelete={() => props.deleteMovieFolder()}
                                                />
                                                :
                                                <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                        }
                                    </div>
                                    <div style={{flex: '1', marginTop: '10px'}}>
                                        {/* To get more details about Google Picker : https://github.com/sdoomz/react-google-picker (in demo specifically) */}
                                        {/* Google Picker API must be enabled in Google developer console */}
                                        <GooglePicker clientId={'348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com'}
                                                      developerKey={'AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0'}
                                                      scope={['https://www.googleapis.com/auth/drive']}
                                                      onChange={data => console.log('on change:', data)}
                                                      onAuthFailed={data => console.log('on auth failed:', data)}
                                                      multiselect={false}
                                                      navHidden={true}
                                                      authImmediate={false}
                                                      mimeTypes={['application/vnd.google-apps.folder']}
                                                      viewId={'FOLDERS'}
                                                      createPicker={ (google, oauthToken) => {
                                                          const googleViewId = google.picker.ViewId.FOLDERS;
                                                          const docsView = new google.picker.DocsView(googleViewId)
                                                              .setIncludeFolders(true)
                                                              .setMimeTypes('application/vnd.google-apps.folder')
                                                              .setSelectFolderEnabled(true);

                                                          const picker = new window.google.picker.PickerBuilder()
                                                              .addView(docsView)
                                                              .setSize(1051,650)
                                                              .setTitle('Select movie folder')
                                                              .setOAuthToken(oauthToken)
                                                              .setDeveloperKey('AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0')
                                                              .setCallback((data)=>{

                                                                  if (data.action === 'picked') {
                                                                      props.setMovieFolder(data.docs[0]);
                                                                  }

                                                              });

                                                          picker.build().setVisible(true);
                                                      }}
                                        >

                                            <IconButton>
                                                <Folder/>
                                            </IconButton>

                                        </GooglePicker>
                                    </div>
                                </div>

                                <div style={{display: 'flex'}}>
                                    <div style={{flex: '1', marginTop: '10px'}}>
                                        Shows
                                    </div>
                                    <div style={{flex: '1', marginTop: '10px'}}>
                                        {
                                            props.tvShowsGdriveFolderName !== null ?
                                                <Chip
                                                    label={props.tvShowsGdriveFolderName}
                                                    onDelete={() => props.deleteShowsFolder()}
                                                />
                                                :
                                                <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                        }
                                    </div>
                                    <div style={{flex: '1', marginTop: '10px'}}>
                                        {/* To get more details about Google Picker : https://github.com/sdoomz/react-google-picker (in demo specifically) */}
                                        {/* Google Picker API must be enabled in Google developer console */}
                                        <GooglePicker clientId={'348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com'}
                                                      developerKey={'AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0'}
                                                      scope={['https://www.googleapis.com/auth/drive']}
                                                      onChange={data => console.log('on change:', data)}
                                                      onAuthFailed={data => console.log('on auth failed:', data)}
                                                      multiselect={false}
                                                      navHidden={true}
                                                      authImmediate={false}
                                                      mimeTypes={['application/vnd.google-apps.folder']}
                                                      viewId={'FOLDERS'}
                                                      createPicker={ (google, oauthToken) => {
                                                          const googleViewId = google.picker.ViewId.FOLDERS;
                                                          const docsView = new google.picker.DocsView(googleViewId)
                                                              .setIncludeFolders(true)
                                                              .setMimeTypes('application/vnd.google-apps.folder')
                                                              .setSelectFolderEnabled(true);

                                                          const picker = new window.google.picker.PickerBuilder()
                                                              .addView(docsView)
                                                              .setSize(1051,650)
                                                              .setTitle('Select Tv Shows folder')
                                                              .setOAuthToken(oauthToken)
                                                              .setDeveloperKey('AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0')
                                                              .setCallback((data)=>{

                                                                  if (data.action === 'picked') {
                                                                      props.setShowsFolder(data.docs[0]);
                                                                  }

                                                              });

                                                          picker.build().setVisible(true);
                                                      }}
                                        >

                                            <IconButton>
                                                <Folder/>
                                            </IconButton>

                                        </GooglePicker>
                                    </div>
                                </div>

                                <div style={{display: 'flex'}}>
                                    <div style={{flex: '1'}}>
                                        Link
                                    </div>
                                    <div style={{flex: '1'}}>
                                        {
                                            props.gdriveToken !== null ?
                                                <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
                                                :
                                                <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                        }
                                    </div>
                                    <div style={{flex: '1'}}>
                                        {
                                            props.gdriveToken !== null ?
                                                <IconButton onClick={props.googleDriveDisConnect}>
                                                    <LinkOff/>
                                                </IconButton>
                                                :
                                                <IconButton onClick={props.googleDriveConnect}>
                                                    <Link/>
                                                </IconButton>
                                        }
                                    </div>
                                </div>

                            </Grid>
                        }
                    </div>
                    :
                    props.storage === 'uptobox' ?
                      <div style={{width: '100%'}}>
                          <div style={{display: 'flex'}}>
                              <div style={{flex: '1'}}>
                                  Link
                              </div>
                              <div style={{flex: '1'}}>
                                  {
                                      props.uptoboxToken !== null ?
                                        <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
                                        :
                                        <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                  }
                              </div>
                              <div style={{flex: '1'}}>
                                  {
                                      props.uptoboxToken !== null ?
                                        <IconButton onClick={props.uptoboxDisconnect}>
                                            <LinkOff/>
                                        </IconButton>
                                        :
                                        <IconButton onClick={props.uptoboxConnect}>
                                            <Link/>
                                        </IconButton>
                                  }
                              </div>
                          </div>
                      </div>
                      :
                      <div>
                          <Grid container spacing={0}>

                              <Grid item xs={12} style={{padding: '6px'}}>
                                  <FormControl fullWidth>
                                      <TextField
                                        label="Path to Movies"
                                        id="movie-path"
                                        variant="outlined"
                                        value={props.moviesPath}
                                        onChange={(event) => props.setMoviesPath(event.target.value)}
                                      />
                                  </FormControl>
                              </Grid>

                              <Grid item xs={12} style={{padding: '6px'}}>
                                  <FormControl fullWidth>
                                      <TextField
                                        label="Path to Tv Shows"
                                        id="tv-shows-path"
                                        variant="outlined"
                                        value={props.tvShowsPath}
                                        onChange={(event) => props.setShowsPath(event.target.value)}
                                      />
                                  </FormControl>
                              </Grid>

                              <Grid item xs={12} sm={2} style={{padding: '6px', position: 'relative', marginRight: '1.6rem', marginTop: '1rem', textAlign: 'left'}}>
                                  <FormControl className="protocolInput" variant="outlined" fullWidth style={{minWidth: '80px', margin: '0 auto', bottom: '6px'}}>
                                      <Select
                                        value={props.protocol}
                                        onChange={props.handleProtocolChange}
                                        input={
                                            <OutlinedInput
                                              labelWidth={0}
                                              name="protocol"
                                              id="protocol"
                                            />
                                        }>

                                          <MenuItem value={'http'}>http</MenuItem>
                                          <MenuItem value={'https'}>https</MenuItem>
                                      </Select>
                                      {/*<FormHelperText>Protocol</FormHelperText>*/}
                                  </FormControl>
                              </Grid>

                              <Grid item xs={12} sm={7} style={{padding: '6px'}}>
                                  <FormControl fullWidth>
                                      <TextField
                                        label="Host"
                                        id="host"
                                        variant="outlined"
                                        value={props.host}
                                        onChange={(event) => props.setHost(event.target.value)}
                                      />
                                  </FormControl>
                              </Grid>

                              <Grid item xs={4} sm={2} style={{padding: '6px'}}>
                                  <FormControl fullWidth>
                                      <TextField
                                        label="Port"
                                        id="port"
                                        variant="outlined"
                                        value={props.port}
                                        onChange={(event) => props.setPort(event.target.value)}
                                      />
                                  </FormControl>
                              </Grid>

                              <Grid item xs={12} style={{padding: '6px'}}>
                                  <FormControl fullWidth>
                                      <TextField
                                        label="Username"
                                        id="nas-username"
                                        variant="outlined"
                                        value={props.nasUsername}
                                        onChange={(event) => props.setNasUserName(event.target.value)}
                                      />
                                  </FormControl>
                              </Grid>

                              <Grid item xs={12} style={{padding: '6px'}}>
                                  <FormControl fullWidth>
                                      <TextField
                                        label="Password"
                                        id="nas-password"
                                        type={props.showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        value={props.nasPassword}
                                        onChange={(event) => props.setNasPassword(event.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                              <InputAdornment position="end">
                                                  <IconButton
                                                    aria-label="Toggle password visibility"
                                                    onClick={props.handleClickShowPassword}
                                                  >
                                                      {props.showPassword ? <VisibilityOff /> : <Visibility />}
                                                  </IconButton>
                                              </InputAdornment>
                                            ),
                                        }}
                                      />
                                  </FormControl>

                              </Grid>

                          </Grid>
                      </div>
                }

            </Grid>
        </ExpansionPanelDetails>
    )
};

export default Storage
