import { Dimensions } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("window");

export const SIZES = {
  // FONT SIZES
  fontSize2: RFPercentage(0.4),
  fontSize4: RFPercentage(0.6),
  fontSize6: RFPercentage(0.8),
  fontSize8: RFPercentage(1),
  fontSize10: RFPercentage(1.2),
  fontSize12: RFPercentage(1.4),
  fontSize14: RFPercentage(1.6),
  fontSize16: RFPercentage(1.8),
  fontSize18: RFPercentage(2),
  fontSize20: RFPercentage(2.2),
  fontSize22: RFPercentage(2.4),
  fontSize24: RFPercentage(2.6),
  fontSize26: RFPercentage(2.8),
  fontSize28: RFPercentage(3),
  fontSize30: RFPercentage(3.2),
  fontSize32: RFPercentage(3.4),
  fontSize34: RFPercentage(3.6),
  fontSize36: RFPercentage(3.8),
  fontSize38: RFPercentage(4),
  fontSize40: RFPercentage(4.2),
  fontSize42: RFPercentage(4.4),
  fontSize44: RFPercentage(4.6),
  fontSize46: RFPercentage(4.8),
  fontSize48: RFPercentage(5),

  // PADDING & MARGINS
  margin2: wp("0.4%"),
  margin4: wp("0.8%"),
  margin6: wp("1.2%"),
  margin8: wp("1.6%"),
  margin10: wp("2%"),
  margin12: wp("2.4%"),
  margin14: wp("2.8%"),
  margin16: wp("3.2%"),
  margin18: wp("3.6%"),
  margin20: wp("4%"),

  padding: wp("0.2%"),
  padding2: wp("0.4%"),
  padding4: wp("0.8%"),
  padding6: wp("1.2%"),
  padding8: wp("1.6%"),
  padding10: wp("2%"),
  padding12: wp("2.4%"),
  padding14: wp("2.8%"),
  padding16: wp("3.2%"),
  padding18: wp("3.6%"),
  padding20: wp("4%"),

  // BORDER RADIUS
  radius2: wp("0.4%"),
  radius4: wp("0.8%"),
  radius6: wp("1.2%"),
  radius8: wp("1.6%"),
  radius10: wp("2%"),
  radius12: wp("2.4%"),
  radius14: wp("2.8%"),
  radius16: wp("3.2%"),
  radius18: wp("3.6%"),
  radius20: wp("4%"),

  // LINE HEIGHTS
  lineHeight2: hp("0.4%"),
  lineHeight4: hp("0.8%"),
  lineHeight6: hp("1.2%"),
  lineHeight8: hp("1.6%"),
  lineHeight10: hp("2%"),
  lineHeight12: hp("2.4%"),
  lineHeight14: hp("2.8%"),
  lineHeight16: hp("3.2%"),
  lineHeight18: hp("3.6%"),
  lineHeight20: hp("4%"),

  // App Dimensions
  width,
  height,
};

export const SIZES_WITH_ALIASES = {
  ...SIZES,
  // ALIASES
  padding: SIZES.padding20,
  fontSize: {
    xs: SIZES.fontSize12,
    sm: SIZES.fontSize14,
    base: SIZES.fontSize16,
    lg: SIZES.fontSize18,
    xl: SIZES.fontSize20,
    "2xl": SIZES.fontSize24,
    "3xl": SIZES.fontSize30,
  },
}; 