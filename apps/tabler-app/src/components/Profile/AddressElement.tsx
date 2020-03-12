import React from 'react';
import { Platform, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Text, Card } from 'react-native-paper';

// tslint:disable-next-line: export-name
// tslint:disable-next-line: function-name
export function AddressElement({ text, location, onPress }) {
    return (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginRight: 16 }}>
            <View style={{ flex: 1, marginRight: 16 }}>
                <Text selectable={Platform.OS === 'ios'} style={{ width: '100%' }}>{text}</Text>
            </View>

            {location && (
                <Card style={{ borderRadius: 4, elevation: 1, width: 80, height: 80, marginTop: -16 }}>
                    <MapView
                        onPress={onPress}
                        zoomEnabled={false}
                        zoomTapEnabled={false}
                        scrollEnabled={false}
                        style={{ borderRadius: 4, width: 80, height: 80, }}
                        initialRegion={{
                            longitude: location.longitude,
                            latitude: location.latitude,
                            latitudeDelta: 0.006,
                            longitudeDelta: 0.006,
                        }}
                    >
                        <Marker coordinate={location} />
                    </MapView>
                </Card>
            )}
        </View>
    );
}
