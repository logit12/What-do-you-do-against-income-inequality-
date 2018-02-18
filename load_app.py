from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
app = Flask(__name__)

global_df = ""
gini_df = ""

@app.route('/', methods=['GET'])
def index():
    global global_df
    list_countries = global_df["name"].unique()
    list_indicators = global_df["indicator"].unique()
    return render_template('index.html', list_countries=list_countries, list_indicators=list_indicators)


@app.route('/instanciate_radar', methods=['POST', 'GET'])
def instanciate_radar():
    list_countries = request.form['list_countries'].split(",")
    list_indicators = request.form['list_indicators'].split(",")

    try:
        gini_from = float(request.form['gini_from'])
        gini_to = float(request.form['gini_to'])
    except:
        gini_from = 0.0
        gini_to = 999.0

    print(gini_from)

    year = int(request.form['year'])
    print(gini_to)

    if (gini_from > 0 and gini_to < 100):
        list_countries = get_country_from_gini(gini_from, gini_to, year)

    indicators_values = get_indicators_values(year, list_countries, list_indicators)

    return jsonify(indicators_values)


@app.route('/instanciate_heatmap', methods=['POST', 'GET'])
def instanciate_heatmap():
    list_countries = request.form['list_countries'].split(",")
    year = int(request.form['year'])

    list_year = list(range(1970, year + 1))
    #list_year = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011]
    list_year_str = []
    for year in list_year:
        list_year_str.append(str(year))
    gini_by_year = get_gini_values(list_year, list_countries)

    final_result = {"gini": gini_by_year,
                    "countries": list_countries,
                    "years": list_year_str}
    return jsonify(final_result)


def get_indicators_values(year, list_countries, list_indicators):
    """
    Get values et scaled values of indicators depending on certain criteria
    :param year:
    :param list_countries:
    :param list_indicators:
    :return: dictionnary {country: {indicator: [value, value_scaled, predicted]}}
    """
    global global_df

    dict_indicators = {}
    for country in list_countries:
        dict_indicators[country] = {}
        for indicator in list_indicators:
            if len(global_df[(global_df["name"] == country)
                    & (global_df["indicator"] == indicator)
                    & (global_df["year"] == int(year))
                    & (~global_df["value"].isnull())]) > 0:

                result = global_df[(global_df["name"] == country) & (global_df["indicator"] == indicator)
                                  & (global_df["year"] == int(year))][["value", "value_scaled", "predicted"]].values[0].tolist()


                value = result[0]
                value_scaled = result[1]
                if result[2]:
                    predicted = 1
                else:
                    predicted = 0

                dict_indicators[country][indicator] = [value, value_scaled, predicted]


            else:

                dict_indicators[country][indicator] = [0, 12.5, 0]

    return dict_indicators



def get_country_from_gini(min_gini, max_gini, year):
    """
    Return for the ear the list of contries whose Gini index is between the min and the max
    :param min_gini:
    :param max_gini:
    :param year:
    :return: list of countries
    """
    global gini_df
    list_countries = gini_df[(gini_df["year"] == int(year)) &
                             (gini_df["value"] >= min_gini) & (gini_df["value"] <= max_gini)]["name"].values.tolist()
    return list_countries



def get_gini_values(list_years, list_countries):
    """
    Get values gini indicators depending on certain criteria
    :param year:
    :param list_countries:
    :return: array of dictionnary [{country:, year:, value:}]
    """
    global gini_df
    gin_result = []
    # list_year_static = np.arange(2000, 2011)

    for year in list_years:
        for country in list_countries:
            if len(gini_df[(gini_df["name"] == country)
                    & (gini_df["year"] == int(year))
                    & (~gini_df["value"].isnull())]) > 0:

                result = gini_df[(gini_df["name"] == country)
                                   & (gini_df["year"] == int(year))][["value"]].values[0].tolist()[0]

                gin_result.append({"month": country, "type": str(year), "value": int(result)})


            else:
                gin_result.append({"month": country, "type": str(year), "value": 0})

    return gin_result


if __name__ == '__main__':

    indicators_path = "static/data/indicators_final.csv"
    gini_path = "static/data/gini_full_final_new.csv"

    global_df = pd.read_csv(indicators_path, sep=";")

    gini_df = pd.read_csv(gini_path)

    app.run(debug=True)

    #list_countries = global_df["name"].unique()

    print(global_df.head())
