// https://gis.stackexchange.com/questions/25877/generating-random-locations-nearby

// tslint:disable: one-variable-per-declaration
// tslint:disable: insecure-random
export const randomLocation = () => {
    const r = 20 * 1000 / 111300 // around 111.300m per degree
    , y0 = 37.2358078 //    37.50117039
    , x0 = -121.9623751 // -122.32749548
    , u = Math.random()
    , v = Math.random()
    , w = r * Math.sqrt(u)
    , t = 2 * Math.PI * v
    , x = w * Math.cos(t)
    , y1 = w * Math.sin(t)
    , x1 = x / Math.cos(y0);

    return {
      latitude: y0 + y1,
      longitude: x0 + x1,
  };
};
