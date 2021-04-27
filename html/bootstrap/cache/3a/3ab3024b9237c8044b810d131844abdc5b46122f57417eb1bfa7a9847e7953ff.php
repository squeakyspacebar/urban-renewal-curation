<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* map.html */
class __TwigTemplate_c574faf6af171a9b88af7bbaceaa2e1a85b4babc2c81ae3183fbdd9614bce1cd extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 1
        echo "<!DOCTYPE html>
<html>
  <head>
    <title>Human Face</title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <meta charset=\"UTF-8\">
    <link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.0.2/dist/leaflet.css\" />
    <link rel=\"stylesheet\" href=\"http://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css\">
    <link rel=\"stylesheet\" href=\"css/leaflet-search.css\" />
    <link rel=\"stylesheet\" href=\"css/style.css\" />
    <link rel=\"stylesheet\" href=\"css/L.Control.SlideMenu.css\">
    <link rel=\"stylesheet\" href=\"css/leaflet-slider.css\"/>
  </head>
  <body>
    <div id=\"site\">
      <div id=\"header\">
      </div>
      <div id=\"content\">
        <div id=\"main\">
          <div id=\"map\">
          </div>
        </div>
      </div>
    </div>
    <div id=\"footer\">
      <div>
        <span>Copyright &copy;. All rights reserved. Design from <a href=\"http://dcicblog.umd.edu/human-face-of-big-data/\" class=\"bft\" >Human-Face Team</a></span>
      </div>
    </div>
    <script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\"></script>
    <script src=\"https://unpkg.com/leaflet@1.0.2/dist/leaflet.js\"></script>
    <script src=\"//apps.bdimg.com/libs/jqueryui/1.10.4/jquery-ui.min.js\"></script>
    <script type=\"text/javascript\" src=\"https://d3js.org/d3.v3.min.js\" ></script>
    <script src=\"//d3js.org/topojson.v1.min.js\"></script>
    <script src=\"js/jquery.firstVisitPopup.js\"></script>
    <script src=\"js/jquery.firstVisitPopup.min.js\"></script>
    <script src=\"js/leaflet-slider.js\"></script>
    <script src=\"js/L.Control.SlideMenu.js\"></script>
    <script src=\"js/leaflet-search.js\"></script>
    <script src=\"js/leaflet.ajax.min.js\"></script>
    <script src=\"js/map.js\"></script>
  </body>
</html>";
    }

    public function getTemplateName()
    {
        return "map.html";
    }

    public function getDebugInfo()
    {
        return array (  37 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "map.html", "/var/www/html/resources/views/map.html");
    }
}
