import React, {useEffect, useState} from "react";
import { isValid, parse } from "postcode";
import { postcodeValidator } from 'postcode-validator';
import axios from "axios";
import {Map, Marker, ZoomControl, Overlay} from "pigeon-maps"
import {
    Button,
    Drawer,
    Input,
    Layout,
    message,
    Row,
    InputNumber,
    Form,
    notification,
    Descriptions, Space, Divider, List, Avatar
} from "antd";
import "./App.css";
import {useDispatch, useSelector} from "react-redux";
import {fetchBreweries} from "./features/brewery";

const {Sider, Content} = Layout;

const SettingsButton = ({...props}) => {
    return (
        <div style={{padding: 8, backgroundColor: "white", borderRadius: 2}}>
            <Button type="primary"
                    size={"large"}
                    onClick={() => props.setVisible(true)}
                    block
            >{props.title}</Button>
        </div>
    )
}

const SettingsDrawer = ({ ...props }) => {
    const dispatch = useDispatch();

    const parsePostal = (postalCode) => {
        // Simple parser... could have been done more complex
        if (isValid(postalCode)) {
            const { postcode } = parse(postalCode)
            return ["UK", postcode]
        } else if (postcodeValidator(postalCode, "US")) {
            return ["US", postalCode]
        }

        return [null, ""]
    }

    const searchPostal = async (postalCode) => {
        // PS, this is not my key... just stole this API from some other website by monitoring the network request!! They exposed the key (:
        let [country, formattedPostal] = parsePostal(postalCode)
        let res;

        if (country === null) {
            throw new Error("Could not find postal code. Please search again.")
        }

        // Which API to ping?
        if (country === "US") {
            res = await axios.get(`https://api.promaptools.com/service/us/zip-lat-lng/get/?zip=${encodeURIComponent(postalCode)}&key=17o8dysaCDrgv1c`)
        } else if (country === "UK") {
            res = await axios.get(`https://api.promaptools.com/service/uk/postcode-lat-lng/get/?postcode=${encodeURIComponent(formattedPostal)}&key=17o8dysaCDrgv1c`)
        }

        // How to serve error based on this API...
        if (res.data.status === -3 || res.data.status === -2) {
            throw new Error(res.data.msg)
        }

        // Setting coordinates
        const coordinates = [parseFloat(res.data.output[0].latitude), parseFloat(res.data.output[0].longitude)]
        props.setCenter(coordinates)

        return coordinates
    }

    const onFinish = (values) => {
        const { postalCode, numResults } = values
        searchPostal(postalCode)
            .then(coordinates => {
                dispatch(fetchBreweries({
                    "coordinates": coordinates,
                    "numResults": numResults
                }))
            })
            .catch(err => message.error(err.message))
    }


    return (
        <Drawer visible={props.visible}
                closable={true}
                onClose={() => props.setVisible(false)}
                title={"Search for a brewery"}
        >
            <Row>
                <Form layout={"vertical"}
                      style={{width: "100%"}}
                      initialValues={{
                          'numResults': 50,
                          'postalCode': "91011",
                      }}
                      onFinish={(values) => onFinish(values)}
                >
                    <Form.Item label={"Postal code"}
                               name={"postalCode"}
                               required={true}
                               // Super naive checker... could've thrown something more sophisticated here.
                               rules={[
                                   {
                                       type: "string",
                                       min: 4,
                                       max: 9,
                                       message: "Must be a valid postal string"
                                   }
                               ]}
                    >
                        <Input placeholder={"postal code (supports US / UK)"}
                               size={"large"}
                        />
                    </Form.Item>
                    <Form.Item label={"Number of results (max 50)"}
                               name={"numResults"}
                               rules={[
                                   {
                                       min: 1,
                                       type: "number",
                                       transform: value => parseInt(value),
                                       message: "must be at least 1"
                                   },
                                   {
                                       max: 50,
                                       type: "number",
                                       transform: value => parseInt(value),
                                       message: "cannot be above 50"
                                   }
                               ]}
                    >
                        <InputNumber style={{width: "100%"}}
                                     size={"large"}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button block
                                type={"primary"}
                                size={"large"}
                                htmlType={"submit"}
                        >
                            Search
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </Drawer>
    )
}

const BreweryListDrawer = ({ ...props }) => {
    const breweries = useSelector(state => state.breweries)

    return (
        <Drawer visible={props.visible}
                closable={true}
                onClose={() => props.setVisible(false)}
                title={`Brewery list`}
        >
            <Row style={{overflowY: "auto"}}>
                <List dataSource={breweries.breweries}
                      style={{width: "100%"}}
                      renderItem={(item, idx) => (
                          <List.Item>
                              <List.Item.Meta avatar={<Avatar>{idx + 1}</Avatar>}
                                              title={item.name}
                                              description={`${item.city}, ${item.postal_code.split("-")[0]}`}
                              />
                          </List.Item>
                      )}
                />
            </Row>
        </Drawer>
    )
}

const DescriptionItem = ({ ...props }) => {
    return (
        <span>
            {props.title ? <b>{props.title}</b> : null}
            {props.description ? <p>{props.description}</p> : null}
        </span>
    )
}

function App() {
    const startingCoordinates = [34.16, -118.0798]
    const [visible, setVisible] = useState(false);
    const [breweryVisible, setBreweryVisible] = useState(false);
    const [center, setCenter] = useState(startingCoordinates)
    const [zoom, setZoom] = useState(11)

    const dispatch = useDispatch();
    const breweries = useSelector(state => state.breweries)

    const openNotification = (anchor, idx) => {
        const brewery = breweries.breweries[idx]
        notification.config({
            maxCount: 1
        })

        notification.info({
            message: <b>{brewery.name}</b>,
            description: (
                <Space direction="vertical" style={{marginTop: 16}}>
                    <DescriptionItem title={"Address"}
                                     description={
                                         <>
                                             {brewery.street
                                                 ? <>{brewery.street}<br/></>
                                                 : null
                                             }
                                             {brewery.city && brewery.postal_code
                                                 ? <>{brewery.city}, {brewery.postal_code.split("-")[0]}</>
                                                 : null
                                             }
                                         </>
                                     }
                    />
                    <DescriptionItem title={"Phone"}
                                     description={brewery.phone ? brewery.phone : "NA"}
                    />
                    <DescriptionItem title={<a href={brewery.website_url}>Website</a>} />
                </Space>
            ),
            placement: "bottomLeft",
            duration: 0,
        })
    }

    useEffect(() => {
        dispatch(fetchBreweries({coordinates: startingCoordinates, numResults: 50}))
    }, [])


    return (
        <Layout hasSider style={{height: "100vh"}}>
            <Content style={{height: "inherit"}}>
              <Map height={"inherit"}
                   center={center}
                   zoom={zoom}
                   onBoundsChanged={({ center, zoom }) => {
                       setCenter(center)
                       dispatch(fetchBreweries({coordinates: center, numResults: 50}))
                       setZoom(zoom)
                   }}
              >
                  <Space direction="vertical" style={{float: "right", margin: 8}}>
                      <SettingsButton setVisible={setVisible}
                                      title={"Search"}
                      />
                      <SettingsButton setVisible={setBreweryVisible}
                                      title={"View brewery list"}
                      />
                  </Space>
                  <ZoomControl />
                  {breweries.breweries.map((brewery, idx) => (
                      <Marker width={50}
                              key={idx}
                              anchor={[parseFloat(brewery.latitude), parseFloat(brewery.longitude)]}
                              onClick={res => openNotification(res.anchor, idx)}
                      />)
                  )}
              </Map>
            </Content>
            <SettingsDrawer visible={visible}
                            setVisible={setVisible}
                            center={center}
                            setCenter={setCenter}
            />
            <BreweryListDrawer visible={breweryVisible}
                               setVisible={setBreweryVisible}
                               center={center}
                               setCenter={setCenter}
           />
        </Layout>
    );
}

export default App;
