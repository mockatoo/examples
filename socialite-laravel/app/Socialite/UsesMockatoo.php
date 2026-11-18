<?php

namespace App\Socialite;

use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Uri;
use LogicException;
use Psr\Http\Message\RequestInterface;

trait UsesMockatoo
{
    private string $authorizationUrl;

    public function useMockatoo(string $origin, string $authorize, array $endpoints): void
    {
        $this->authorizationUrl = $origin.$authorize;
        $stack = HandlerStack::create();
        $stack->push(Middleware::mapRequest(function (RequestInterface $request) use ($origin, $endpoints) {
            $uri = $request->getUri();
            $endpoint = (string) $uri->withQuery('');

            // Fail closed if a Socialite upgrade changes an endpoint.
            $path = $endpoints[$endpoint] ?? throw new LogicException('Missing Mockatoo endpoint.');

            return $request->withUri(new Uri($origin.$path.'?'.$uri->getQuery()));
        }));

        $this->setHttpClient(new Client([
            'handler' => $stack,
            'allow_redirects' => false,
            'timeout' => 10,
        ]));
    }

    protected function buildAuthUrlFromBase($url, $state)
    {
        return parent::buildAuthUrlFromBase($this->authorizationUrl, $state);
    }
}
